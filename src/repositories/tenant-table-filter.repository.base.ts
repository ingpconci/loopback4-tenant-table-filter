import {inject} from '@loopback/context';
import {
  Count,
  DataObject,
  DefaultCrudRepository,
  Entity,
  Filter,
  FilterExcludingWhere,
  juggler,
  Options,
  Where
} from '@loopback/repository';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
// debug
import debugFactory from 'debug';

const debug = debugFactory('loopback:tenant-table-filter:repository');

import {promisify} from 'util';
import {TokenServiceBindings} from '../services/keys';
import {PermittedTenant} from '../services/multitenant-jwt.service';
const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);

export interface WithTenantId {
  tenantId: number
}

export class TenantTableFilterRepository<
  T extends Entity & WithTenantId,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {


  @inject(SecurityBindings.USER, {optional: true}) public userProfile?: UserProfile;
  @inject(RestBindings.Http.REQUEST, {optional: true}) request?: Request;
  @inject(TokenServiceBindings.TOKEN_SECRET, {optional: true}) private jwtSecret: string;


  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    @inject('datasources.db') dataSource: juggler.DataSource
  ) {
    //debug('TenantTableFilterRepository.constructor: ');
    super(entityClass, dataSource);
  }


  /*
  create
  */
  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    debug('TenantTableFilterRepository.create: ');
    // ---------------------------------------------------------------------------
    // Add the tenantId field
    // ---------------------------------------------------------------------------
    const tenantId: number = await this.getUserPermittedTenantId(this.userProfile, this.request);
    entity.tenantId = tenantId;

    return super.create(entity, options);
  }

  /*
  createNoTenantIdFilter
  */
  async createNoTenantIdFilter(entity: DataObject<T>, options?: Options): Promise<T> {
    debug('TenantTableFilterRepository.createNoTenantIdFilter: ');
    return super.create(entity, options);
  }

  /*
  count
  */
  async count(where?: Where<T>, options?: Options): Promise<Count> {
    debug('TenantTableFilterRepository.count: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const whereModifiedWithTenantId = await this.appendTenantIdWhere(this.userProfile, this.request, where);
    return super.count(whereModifiedWithTenantId, options);
  }

  /*
  countNoTenantIdFilter
  */
  async countNoTenantIdFilter(where?: Where<T>, options?: Options): Promise<Count> {
    debug('TenantTableFilterRepository.countNoTenantIdFilter: ');
    return super.count(where, options);
  }


  /*
  find
  */
  async find(
    filter?: Filter<T>,
    options?: Options,

  ): Promise<(T & Relations)[]> {
    debug('TenantTableFilterRepository.find: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const filterModifiedWithTenantId = await this.appendTenantIdFilter(this.userProfile, this.request, filter);
    //const data = await super.find(filterModifiedWithTenantId, options);
    //return data;
    return super.find(filterModifiedWithTenantId, options);
  }

  /*
  findNoTenantIdFilter
  */
  async findNoTenantIdFilter(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
    debug('TenantTableFilterRepository.findNoTenantIdFilter: ');
    return super.find(filter, options);
  }


  /*
  findById
  */
  async findById(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: Options
  ): Promise<T & Relations> {
    debug('TenantTableFilterRepository.findById: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    let filterWithWhere: any = filter as Filter<T>;
    if (filter) {
      filterWithWhere = filter;
      filterWithWhere.where = {
        id: {eq: id}
      }
    }
    else {
      filterWithWhere = {
        where: {
          id: {eq: id}
        }
      }
    }

    const filterModifiedWithTenantId = await this.appendTenantIdFilter(this.userProfile, this.request, filterWithWhere);
    const data = await super.find(filterModifiedWithTenantId, options);
    if (data && data.length > 0) {
      return data[0];
    } else {
      const errorMsg = 'Record Id Not Valid!';
      console.error('findById: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }
    //return super.findOne(filterModifiedWithTenantId, options);
    //return super.findById(id, filter);
  }

  async findByIdNoTenantIdFilter(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: Options
  ): Promise<T & Relations> {
    debug('TenantTableFilterRepository.findByIdNoTenantIdFilter: ');
    return super.findById(id, filter);
  }

  /*
  findOne
  */
  async findOne(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null> {
    debug('TenantTableFilterRepository.findOne: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const filterModifiedWithTenantId = await this.appendTenantIdFilter(this.userProfile, this.request, filter);
    //const data = await super.find(filterModifiedWithTenantId, options);
    const data = await super.find(filterModifiedWithTenantId, options);
    if (data && data.length > 0) {
      return data[0];
    } else {
      const errorMsg = 'Record Id Not Valid!';
      console.error('findById: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }
  }

  /*
findOneNoTenantIdFilter
*/
  async findOneNoTenantIdFilter(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null> {
    debug('TenantTableFilterRepository.findOneNoTenantIdFilter: ');
    return super.findOne(filter, options);
  }

  /*
  updateAll
  */
  async updateAll(dataObject: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
    debug('TenantTableFilterRepository.updateAll: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const whereModifiedWithTenantId = await this.appendTenantIdWhere(this.userProfile, this.request, where);
    //const data = await super.find(filterModifiedWithTenantId, options);
    //return data;
    return super.updateAll(dataObject, whereModifiedWithTenantId, options);
  }

  /*
  updateAllNoTenantIdFilter
  */
  async updateAllNoTenantIdFilter(dataObject: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
    debug('TenantTableFilterRepository.updateAllNoTenantIdFilter: ');
    return super.updateAll(dataObject, where, options);
  }


  /*
  updateById
  */
  async updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    debug('TenantTableFilterRepository.updateById: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const filterWithWhere: any = {
      where: {id: {eq: id}},
    }
    const filterModifiedWithTenantId = await this.appendTenantIdFilter(this.userProfile, this.request, filterWithWhere);
    const recordCurrentTenant = await this.findOne(filterModifiedWithTenantId);
    if (!recordCurrentTenant) {
      const errorMsg = 'Updating Record Id not valid!';
      throw new HttpErrors.BadRequest(errorMsg);
    }
    await super.updateById(id, data, options);
  }

  /*
  updateByIdNoTenantIdFilter
  */
  async updateByIdNoTenantIdFilter(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    debug('TenantTableFilterRepository.updateByIdNoTenantIdFilter: ');
    const where: any = {
      id: {eq: id}
    }
    const result = await this.updateAllNoTenantIdFilter(data, where, options);
    if (result.count === 0) {
      const errorMsg = 'Entity Not Updated!';
      console.error('updateByIdNoTenantIdFilter: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }
  }

  /*
    replaceById
  */
  async replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    debug('TenantTableFilterRepository.replaceById: ');
    const errorMsg = 'Method Not Allowed!';
    console.error('replaceById: ', errorMsg);
    throw new HttpErrors.MethodNotAllowed(errorMsg);
  }

  /*
  deleteById
  */
  async deleteById(id: ID, options?: Options): Promise<void> {
    debug('TenantTableFilterRepository.deleteById: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const filterWithWhere: any = {
      where: {id: {eq: id}},
    }
    const filterModifiedWithTenantId = await this.appendTenantIdFilter(this.userProfile, this.request, filterWithWhere);
    const recordCurrentTenant = await this.findOne(filterModifiedWithTenantId);
    if (!recordCurrentTenant) {
      const errorMsg = 'Deleting Record Id not valid!';
      throw new HttpErrors.BadRequest(errorMsg);
    }

    return super.deleteById(id, options);
  }

  /*
  deleteByIdNoTenantIdFilter
  */
  async deleteByIdNoTenantIdFilter(id: ID, options?: Options): Promise<void> {
    debug('TenantTableFilterRepository.deleteByIdNoTenantIdFilter: ');
    return super.deleteById(id, options);
  }

  /*
    deleteAll
  */
  async deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    debug('TenantTableFilterRepository.deleteAll: ');
    const errorMsg = 'Method Not Allowed!';
    console.error('deleteAll: ', errorMsg);
    throw new HttpErrors.MethodNotAllowed(errorMsg);
  }



  /*
  ------------------------------------------------------------------------------
  Util
  ------------------------------------------------------------------------------
  */

  async getUserPermittedTenantId(currentUserProfile: UserProfile | undefined, request: Request | undefined): Promise<number> {
    debug('getUserPermittedTenantId: currentUserProfile=', currentUserProfile);

    let tenantId = -1;
    //try {

    let userId = 0;

    if (currentUserProfile) {
      userId = Number(currentUserProfile[securityId]);
    } else {
      const errorMsg = 'UserId Not Valid!';
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }

    //------------------------------------------------------------------------
    // Get the tenantId from request Header: x-tenant-id
    //------------------------------------------------------------------------
    let tenantIdString: string;

    if (this.request) {
      debug('getUserPermittedTenantId: request.headers=', this.request.headers);
      tenantIdString = this.request.headers['x-tenant-id'] as string;
      debug('getUserPermittedTenantId: headers => tenantIdString=', tenantIdString);

      if (tenantIdString !== undefined && tenantIdString.length > 0) {
        tenantId = Number.parseInt(tenantIdString);
        debug('getUserPermittedTenantId: headers tenantId=', tenantId);
        if (Number.isNaN(tenantId)) {
          const errorMsg = 'Error: tenantId from request Header Not Valid!';
          console.error('getUserPermittedTenantId: ', errorMsg);
          //throw new HttpErrors.BadRequest(errorMsg);
        }
      }
    }

    //------------------------------------------------------------------------
    // Get the decoded token
    //------------------------------------------------------------------------
    let decodedToken = undefined;
    if (this.request) {
      const authorization = this.request.headers['authorization'] as string;
      debug('getUserPermittedTenantId: authorization', authorization);
      if (authorization?.startsWith('Bearer ')) {
        //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
        const parts = authorization.split(' ');
        const token = parts[1];
        debug('getUserPermittedTenantId:  JWT token', authorization);
        try {
          // https://www.npmjs.com/package/jsonwebtoken
          // get the decoded payload ignoring signature, no secretOrPrivateKey needed
          //var decoded = jwt.decode(token);
          //const json = jwt.decode(token, {json: true});
          decodedToken = await verifyAsync(token, this.jwtSecret);
          debug('getUserPermittedTenantId: decodedToken=', JSON.stringify(decodedToken, undefined, 4));
        } catch (error) {
          throw new HttpErrors.Unauthorized(
            `Error verifying token: ${error.message}`,
          );
        }
      }
    }
    if (decodedToken === undefined) {
      const errorMsg = 'authorization Token Not Valid!';
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
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
      debug('getUserPermittedTenantId: permittedTenant=', permittedTenant);
      if (permittedTenant.tenantId === tenantId) {
        debug('getUserPermittedTenantId: current selected permittedTenant=', permittedTenant);
        tenantIdIsPermitted = true;
        if (permittedTenant.roles) {
          currentTenantUserRoles = currentTenantUserRoles.concat(permittedTenant.roles);
        }
      }
    }
    if (tenantIdIsPermitted === false) {
      const errorMsg = 'TenantId Filter Not Permitted for User Id=' + decodedToken.id;
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }
    debug('getUserPermittedTenantId: currentTenantUserRoles=', currentTenantUserRoles);


    /*
    Get the tenantId from Header
    */
    /*
     let tenantIdString;
     if (request) {
       tenantIdString = request.headers['x-tenant-id'] as string;
     } else {
       const errorMsg = 'TenantId Filter Not Valid!';
       console.error('getUserPermittedTenantId: ', errorMsg);
       throw new HttpErrors.BadRequest(errorMsg);
     }
     */

    /*
    Get the tenantId from JWT
    */

    /*
    debug('getUserPermittedTenantId: tenantIdString=', tenantIdString);

    const tenantId: number = Number.parseInt(tenantIdString);
    if (Number.isNaN(tenantId)) {
      const errorMsg = 'TenantId Filter Not Valid!';
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }
    */


    debug('getUserPermittedTenantId: return tenantId=', tenantId);

    return tenantId;
  }

  async appendTenantIdFilter(
    currentUserProfile: UserProfile | undefined,
    request: Request | undefined,
    filter: any): Promise<object | undefined> {
    debug('addTenantIdFilter: filter=', JSON.stringify(filter));
    const tenantId: number = await this.getUserPermittedTenantId(currentUserProfile, request);


    let filterModified: any;

    if (filter) {
      filterModified = filter;
      if (filter.where) {
        filterModified.where = {
          and: [
            filter.where,
            {
              tenantId: {eq: tenantId}
            }
          ]
        }
      } else {
        filterModified.where = {
          tenantId: {eq: tenantId}
        }
      }
    }
    else {
      filterModified = {
        where: {
          tenantId: {eq: tenantId}
        }
      }
    }
    //
    //filter = filterModified;

    debug('addTenantIdFilter: filterModified=', JSON.stringify(filterModified));

    return filterModified;

  }

  async appendTenantIdWhere(
    currentUserProfile: UserProfile | undefined,
    request: Request | undefined,
    where: any): Promise<object | undefined> {
    debug('appendTenantIdWhere: where=', JSON.stringify(where));
    const tenantId: number = await this.getUserPermittedTenantId(currentUserProfile, request);

    let whereModified: any;

    if (where) {
      whereModified = {
        and: [
          where,
          {
            tenantId: {eq: tenantId}
          }
        ]
      }
    } else {
      whereModified = {
        tenantId: {eq: tenantId}
      }
    }

    debug('appendTenantIdWhere: whereModified=', JSON.stringify(whereModified));

    return whereModified;

  }

}
