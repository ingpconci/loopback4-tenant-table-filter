import {TokenService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import debugFactory from 'debug';
import {promisify} from 'util';
import {TokenServiceBindings} from './keys';
const debug = debugFactory('loopback:tenant-table-filter:jwt-service');

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export interface PermittedTenant {
  tenantId: number;
  tenantName: string;
  roles: string[];
}

export class MultitenantJwtService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET) private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN) private jwtExpiresIn: string,
    @inject(RestBindings.Http.REQUEST, {optional: true}) private request: Request
  ) { }

  /*
   * verifyToken methods
   */
  async verifyToken(token: string): Promise<UserProfile> {
    debug('verifyToken: token=', token);
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);

      debug('verifyToken: decodedToken=', JSON.stringify(decodedToken, undefined, 4));
      // console.log('JwtService.verifyToken: decodedToken=', decodedToken)
      /*
      {
        "id":"4",
        "name":"Firstname Surname",
        "defaultTenantId":1,
        "permittedTenants":[
        {
            "tenantId":0,
            "tenantName":"APPLICATION",
            "roles":["ADMINISTRATOR"]
        },
        {
            "tenantId":1,
            "tenantName":"TENANT1",
            "roles":["ADMINISTRATOR","USER"]
        },
        ],
        "iat":1673115321,
        "exp":1673151321
      }*/

      //------------------------------------------------------------------------
      // Get the tenantId from request Header: x-tenant-id
      //------------------------------------------------------------------------
      let tenantIdString: string;
      let tenantId = -1;
      if (this.request) {
        debug('verifyToken: request.headers=', this.request.headers);
        tenantIdString = this.request.headers['x-tenant-id'] as string;
        debug('verifyToken: headers => tenantIdString=', tenantIdString);

        if (tenantIdString !== undefined && tenantIdString.length > 0) {
          tenantId = Number.parseInt(tenantIdString);
          debug('verifyToken: headers tenantId=', tenantId);
          if (Number.isNaN(tenantId)) {
            const errorMsg = 'Error: tenantId from request Header Not Valid!';
            console.error('verifyToken: ', errorMsg);
            //throw new HttpErrors.BadRequest(errorMsg);
          }
        }
      }

      //------------------------------------------------------------------------
      // if tenantId non present in the header, check the token payload for defaultTenantId
      //------------------------------------------------------------------------
      if (tenantId === -1 && decodedToken.defaultTenantId !== undefined) {
        tenantId = Number.parseInt(decodedToken.defaultTenantId);
        if (Number.isNaN(tenantId)) {
          const errorMsg = 'Error: defaultTenantId from token Not Valid!';
          console.error('verifyToken: ', errorMsg);
          //throw new HttpErrors.BadRequest(errorMsg);
        }
        debug('verifyToken: decodedToken.defaultTenantId => tenantId=', tenantId);
      }


      //------------------------------------------------------------------------
      // Check the validity of tenantId
      //------------------------------------------------------------------------
      if (tenantId < 0) {
        const errorMsg = 'TenantId Filter Not Valid!';
        console.error('verifyToken: ', errorMsg);
        throw new HttpErrors.BadRequest(errorMsg);
      }

      //------------------------------------------------------------------------
      // Check the permission of tenantId and the roles for the currentTenantId
      //------------------------------------------------------------------------
      let tenantIdIsPermitted = false;
      let currentTenantUserRoles: string[] = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < decodedToken.permittedTenants.length; index++) {
        const permittedTenant: PermittedTenant = decodedToken.permittedTenants[index];
        debug('verifyToken: permittedTenant=', permittedTenant);
        if (permittedTenant.tenantId === tenantId) {
          debug('verifyToken: current selected permittedTenant=', permittedTenant);
          tenantIdIsPermitted = true;
          if (permittedTenant.roles) {
            currentTenantUserRoles = currentTenantUserRoles.concat(permittedTenant.roles);
          }
        }
      }
      if (tenantIdIsPermitted === false) {
        const errorMsg = 'TenantId Filter Not Permitted for User Id=' + decodedToken.id;
        console.error('verifyToken: ', errorMsg);
        throw new HttpErrors.BadRequest(errorMsg);
      }
      debug('verifyToken: currentTenantUserRoles=', currentTenantUserRoles);


      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {[securityId]: '', name: ''},
        {
          [securityId]: decodedToken.id,
          name: decodedToken.name,
          id: decodedToken.id,
          userRoles: currentTenantUserRoles
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: ${error.message}`,
      );
    }

    debug('verifyToken: return userProfile=', userProfile);
    return userProfile;
  }

  /**
   * generateToken NOT IMPLEMENTED HERE
   * @param userProfile
   * @returns
   */
  async generateToken(userProfile: UserProfile): Promise<string> {
    debug('generateToken: userProfile=', userProfile);
    throw new HttpErrors.NotImplemented(
      'Error generating token: NOT IMPLEMENTED HERE',
    );
  }


}
