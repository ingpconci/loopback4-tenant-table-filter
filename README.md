# loopback4-tenant-table-filter

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install Loopback4TenantTableFilterComponent using `npm`;

```sh
$ [npm install | yarn add] loopback4-tenant-table-filter
```

## Basic Use

Configure and load Loopback4TenantTableFilterComponent in the application constructor
as shown below.

```ts
import {Loopback4TenantTableFilterComponent, Loopback4TenantTableFilterComponentOptions, DEFAULT_LOOPBACK4_TENANT_TABLE_FILTER_OPTIONS} from 'loopback4-tenant-table-filter';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: Loopback4TenantTableFilterComponentOptions = DEFAULT_LOOPBACK4_TENANT_TABLE_FILTER_OPTIONS;
    this.configure(Loopback4TenantTableFilterComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(Loopback4TenantTableFilterComponent);
    // ...
  }
  // ...
}
```
