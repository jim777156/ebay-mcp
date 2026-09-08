# eBay Ops MCP Privacy Policy

_Last updated: 8 September 2026_

## Purpose

eBay Ops MCP is a private/internal application used by its operator to research, manage, and evaluate the operator's own eBay activity through eBay APIs.

## Information the application may access

When authorised through eBay OAuth, the application may access only the eBay information permitted by the scopes granted by the eBay user. Depending on the enabled tools, this may include account and business-policy information, listings and inventory, marketing and analytics information, public marketplace data, and images or listing content the user chooses to work with.

The application does not request an eBay password. Authentication is performed using eBay OAuth credentials and tokens.

## How information is used

Information obtained from eBay is used only to perform user-requested eBay research, listing, account, analytics, marketing, image, and related seller-management tasks.

The application does not sell personal information and does not use eBay data for advertising.

## Connected clients and service providers

When eBay Ops MCP is used through an MCP client or AI host, information requested from eBay may be returned to that client so it can fulfil the user's instruction. The handling of information by that client is subject to the client's own privacy terms.

Apart from eBay and the client/service used by the operator to run the application, the application does not intentionally disclose eBay information to unrelated third parties.

## Storage and security

Application credentials and OAuth tokens are intended to be stored locally in ignored configuration files or other secret-storage mechanisms and must not be committed to the public source repository.

The application does not require an external customer database for normal operation. Operational logs may be retained locally for troubleshooting, but secrets and full OAuth tokens should not be written to logs.

## Retention and deletion

The operator may remove locally stored credentials, tokens, logs, or other application data when they are no longer required. eBay authorisation can also be revoked through the relevant eBay account or developer-authorisation controls.

## Scope and changes

This application is currently intended for private/internal use. If its use expands materially, this policy will be updated before broader deployment.

## Contact

Privacy questions about eBay Ops MCP can be raised through the public GitHub repository for the project:

`https://github.com/jim777156/ebay-mcp`
