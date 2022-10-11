import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer} from '@loopback/authorization';
import {Provider} from '@loopback/core';
import debugFactory from 'debug';
const debug = debugFactory('loopback:tenant-table-filter:multitenant-authorizer');

export class MultitenantAuthorizerProvider implements Provider<Authorizer> {

  /*
  @inject(RestBindings.Http.REQUEST, {optional: true}) request?: Request;
  */

  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    metadata: AuthorizationMetadata
  ) {
    //debug('authorize: resource=' + context.resource + ' metadata=', metadata, ' context=', context);
    debug('authorize: resource=' + context.resource + ' metadata=', metadata);

    /*
    metadata= { allowedRoles: [ 'Administrator', 'Viewer' ] }
    context= {
      principals: [
        {
          name: 'Paolo Conci',
          id: '1',
          permittedTenants: [Array],
          type: 'USER',
          [Symbol(securityId)]: '1'
        }
      ],
      roles: [],
      scopes: [],
      resource: 'PingController.prototype.ping',
      invocationContext: <ref *1> InterceptedInvocationContext {
        ...
    */




    /*
        const clientRole = authorizationCtx.principals[0].role;
        const allowedRoles = metadata.allowedRoles;
        return allowedRoles.includes(clientRole)
          ? AuthorizationDecision.ALLOW
          : AuthorizationDecision.DENY;
          */
    //events.push(context.resource);



    /*
    Get the tenantId from Header

    let tenantIdString;
    if (this.request) {
      debug('authorize: request.headers=', this.request.headers);
      tenantIdString = this.request.headers['x-tenant-id'] as string;
      debug('authorize: tenantIdString=', tenantIdString);

      const tenantId: number = Number.parseInt(tenantIdString);
      if (Number.isNaN(tenantId)) {
        const errorMsg = 'TenantId Filter Not Valid!';
        console.error('MultitenantAuthorizerProvider.authorize: ', errorMsg);
        //throw new HttpErrors.BadRequest(errorMsg);
      }
    } else {
      const errorMsg = 'TenantId Filter Not Valid!';
      console.error('MultitenantAuthorizerProvider.authorize: ', errorMsg);
      //throw new HttpErrors.BadRequest(errorMsg);
    }
    */


    /*
    if (
      context.resource === 'OrderController.prototype.cancelOrder' &&
      context.principals[0].name === 'user-01'
    ) {
      return AuthorizationDecision.DENY;
    }
    return AuthorizationDecision.ALLOW;
    */
    /*
        const clientPermittedScopes = authorizationCtx.principals[0].role;
        const allowedScopes = metadata.scopes;
        return allowedScopes.includes(clientRole)
          ? AuthorizationDecision.ALLOW
          : AuthorizationDecision.DENY;
    */

    //return AuthorizationDecision.ALLOW;
    debug('authorize: resource=' + context.resource + ' principal=', context.principals[0]);
    let roleIsAllowed = false;
    for (const role of context.principals[0].userRoles) {
      if (metadata.allowedRoles!.includes(role)) {
        roleIsAllowed = true;
        break;
      }
    }
    debug('authorize: resource=' + context.resource + ' roleIsAllowed=', roleIsAllowed);

    if (roleIsAllowed) {
      return AuthorizationDecision.ALLOW;
    }
    else {
      return AuthorizationDecision.DENY;
    }

  }
}
