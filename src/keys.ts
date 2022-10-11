import {BindingKey, CoreBindings} from '@loopback/core';
import {Loopback4TenantTableFilterComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace Loopback4TenantTableFilterComponentBindings {
  export const COMPONENT = BindingKey.create<Loopback4TenantTableFilterComponent>(
    `${CoreBindings.COMPONENTS}.Loopback4TenantTableFilterComponent`,
  );
}
