import {
  Application,
  injectable,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
} from '@loopback/core';
import {Loopback4TenantTableFilterComponentBindings} from './keys'
import {DEFAULT_LOOPBACK4_TENANT_TABLE_FILTER_OPTIONS, Loopback4TenantTableFilterComponentOptions} from './types';

// Configure the binding for Loopback4TenantTableFilterComponent
@injectable({tags: {[ContextTags.KEY]: Loopback4TenantTableFilterComponentBindings.COMPONENT}})
export class Loopback4TenantTableFilterComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: Loopback4TenantTableFilterComponentOptions = DEFAULT_LOOPBACK4_TENANT_TABLE_FILTER_OPTIONS,
  ) {}
}
