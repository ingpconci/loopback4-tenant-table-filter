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
      Get the tenantId from Header
      */
      let tenantIdString;
      let tenantId: number = -1;
      if (this.request) {
        debug('verifyToken: request.headers=', this.request.headers);
        tenantIdString = this.request.headers['x-tenant-id'] as string;
        debug('verifyToken: tenantIdString=', tenantIdString);

        tenantId = Number.parseInt(tenantIdString);
        if (Number.isNaN(tenantId)) {
          const errorMsg = 'TenantId Filter Not Valid!';
          console.error('verifyToken: ', errorMsg);
          //throw new HttpErrors.BadRequest(errorMsg);
        }
      } else {
        const errorMsg = 'TenantId Filter Not Valid!';
        console.error('verifyToken: ', errorMsg);
        //throw new HttpErrors.BadRequest(errorMsg);
      }

      //------------------------------------------------------------------------
      // Get the roles for the currentTenantId
      //------------------------------------------------------------------------
      let currentTenantUserRoles: string[] = [];
      for (let index = 0; index < decodedToken.permittedTenants.length; index++) {
        const permittedTenant: PermittedTenant = decodedToken.permittedTenants[index];
        debug('verifyToken: permittedTenant=', permittedTenant);
        if (permittedTenant.tenantId == tenantId && permittedTenant.roles) {
          debug('verifyToken: current selected permittedTenant=', permittedTenant);
          currentTenantUserRoles = currentTenantUserRoles.concat(permittedTenant.roles);
        }
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
