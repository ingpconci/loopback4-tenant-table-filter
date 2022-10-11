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

const debug = debugFactory('loopback:tenant-table-filter');

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
    const tenantId: number = this.getUserPermittedTenantId(this.userProfile, this.request);
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
    const whereModifiedWithTenantId = this.appendTenantIdWhere(this.userProfile, this.request, where);
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
    const filterModifiedWithTenantId = this.appendTenantIdFilter(this.userProfile, this.request, filter);
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

    const filterModifiedWithTenantId = this.appendTenantIdFilter(this.userProfile, this.request, filterWithWhere);
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
    const filterModifiedWithTenantId = this.appendTenantIdFilter(this.userProfile, this.request, filter);
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
  updateAll(dataObject: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
    debug('TenantTableFilterRepository.updateAll: ');
    // ---------------------------------------------------------------------------
    // Filtered by tenantId field
    // ---------------------------------------------------------------------------
    const whereModifiedWithTenantId = this.appendTenantIdWhere(this.userProfile, this.request, where);
    //const data = await super.find(filterModifiedWithTenantId, options);
    //return data;
    return super.updateAll(dataObject, whereModifiedWithTenantId, options);
  }

  /*
  updateAllNoTenantIdFilter
  */
  updateAllNoTenantIdFilter(dataObject: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
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
    const filterModifiedWithTenantId = this.appendTenantIdFilter(this.userProfile, this.request, filterWithWhere);
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
    const filterModifiedWithTenantId = this.appendTenantIdFilter(this.userProfile, this.request, filterWithWhere);
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
    normalizeFilter(
      filter?: Filter<T>,
    ): legacy.Filter | undefined {
      //debug('TenantTableFilterRepository.normalizeFilter: filter=', filter);
      const filterNormalized = super.normalizeFilter(filter);

      //this.getUserPermittedTenantId();

      //debug('TenantTableFilterRepository.normalizeFilter: filterNormalized=', filterNormalized);
      return filterNormalized;
    }
  */


  /*
  ------------------------------------------------------------------------------
  Util
  ------------------------------------------------------------------------------
  */

  getUserPermittedTenantId(currentUserProfile: UserProfile | undefined, request: Request | undefined): number {
    debug('getUserPermittedTenantId: currentUserProfile=', currentUserProfile);

    let userId = 0;

    if (currentUserProfile) {
      userId = Number(currentUserProfile[securityId]);
    } else {
      const errorMsg = 'UserId Not Valid!';
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }

    /*
    Get the tenantId from Header
    */
    let tenantIdString;
    if (request) {
      tenantIdString = request.headers['x-tenant-id'] as string;
    } else {
      const errorMsg = 'TenantId Filter Not Valid!';
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }

    /*
    Get the tenantId from JWT
    */
    //const tenantIdInfo = this.identifyTenantFromJwt(request);
    //debug('getUserPermittedTenantId: tenantIdInfo=', tenantIdInfo);

    debug('getUserPermittedTenantId: tenantIdString=', tenantIdString);

    const tenantId: number = Number.parseInt(tenantIdString);
    if (Number.isNaN(tenantId)) {
      const errorMsg = 'TenantId Filter Not Valid!';
      console.error('getUserPermittedTenantId: ', errorMsg);
      throw new HttpErrors.BadRequest(errorMsg);
    }


    debug('getUserPermittedTenantId: return tenantId=', tenantId);

    return tenantId;
  }

  appendTenantIdFilter(
    currentUserProfile: UserProfile | undefined,
    request: Request | undefined,
    filter: any): object | undefined {
    debug('addTenantIdFilter: filter=', JSON.stringify(filter));
    const tenantId: number = this.getUserPermittedTenantId(currentUserProfile, request);

    /*
    debug('addTenantIdFilter: currentUserProfile=', currentUserProfile);
    const userId = Number(currentUserProfile[securityId]);

    debug('addTenantIdFilter: filter=', JSON.stringify(filter));

    const tenantIdString = request.headers['x-tenant-id'] as string;
    debug('addTenantIdFilter: tenantIdString=', tenantIdString);

    const tenantId: number = Number.parseInt(tenantIdString);
    if (Number.isNaN(tenantId)) {
      const errorMsg = 'TenantId Filter Not Valid!';
      throw new HttpErrors.BadRequest(errorMsg);
    }
    debug('addTenantIdFilter: tenantId=', tenantId);
    */

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

  appendTenantIdWhere(
    currentUserProfile: UserProfile | undefined,
    request: Request | undefined,
    where: any): object | undefined {
    debug('appendTenantIdWhere: where=', JSON.stringify(where));
    const tenantId: number = this.getUserPermittedTenantId(currentUserProfile, request);
    /*
    debug('addTenantIdFilter: currentUserProfile=', currentUserProfile);


    const tenantIdString = request.headers['x-tenant-id'] as string;
    debug('appendTenantIdWhere: tenantIdString=', tenantIdString);

    const tenantId: number = Number.parseInt(tenantIdString);
    if (Number.isNaN(tenantId)) {
      const errorMsg = 'TenantId Filter Not Valid!';
      throw new HttpErrors.BadRequest(errorMsg);
    }
    debug('appendTenantIdWhere: tenantId=', tenantId);
    */

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
