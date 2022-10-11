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
