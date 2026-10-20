export interface paths {
    "/compatibility": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Client compatibility contract */
        get: operations["get__compatibility"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Authenticated Prometheus metrics */
        get: operations["get__metrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Web login; refresh token is an HttpOnly cookie */
        post: operations["post__auth_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Rotate web refresh cookie */
        post: operations["post__auth_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/native/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Native login; store refresh token in OS secure storage */
        post: operations["post__auth_native_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/native/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Rotate native refresh token */
        post: operations["post__auth_native_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke current or all sessions */
        post: operations["post__auth_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke current or all sessions */
        post: operations["post__auth_logout_all"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current user, permissions and project assignments */
        get: operations["get__auth_me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change password and revoke all sessions */
        post: operations["post__auth_change_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request one-time password recovery email */
        post: operations["post__auth_forgot_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Redeem a reset token and revoke sessions */
        post: operations["post__auth_reset_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List your device sessions */
        get: operations["get__auth_sessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoke one of your device sessions */
        delete: operations["delete__auth_sessions__id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register authenticated push installation */
        post: operations["post__devices"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/devices/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoke push installation */
        delete: operations["delete__devices__id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/profile/photo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update only your own profile photo; JPEG, PNG or WebP up to 5 MiB */
        post: operations["post__portal_profile_photo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your account identity and profile photo, falling back to your linked customer photo */
        get: operations["get__portal_account"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/bookings/{id}/statement/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download a scoped PDF statement of your booking and own payments */
        get: operations["get__portal_bookings__id_statement_download"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Accept a one-time customer invitation; existing customers must enter their current password */
        post: operations["post__portal_activate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/customers/{id}/portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** View customer portal invitation and access status */
        get: operations["get__projects__projectId_customers__id_portal"];
        put?: never;
        post?: never;
        /** Revoke customer portal access and pending invitations */
        delete: operations["delete__projects__projectId_customers__id_portal"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/customers/{id}/portal/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Email a 48-hour customer portal invitation */
        post: operations["post__projects__projectId_customers__id_portal_invite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/customers/{id}/portal/resend-credentials": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Email fresh credentials only to a new customer before their first sign-in */
        post: operations["post__projects__projectId_customers__id_portal_resend_credentials"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your linked customer profiles */
        get: operations["get__portal_profile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your confirmed-booking balances by project and next unpaid installments */
        get: operations["get__portal_dashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List only bookings you own */
        get: operations["get__portal_bookings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/bookings/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your booking detail and exact payment position */
        get: operations["get__portal_bookings__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/installments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your active-booking installments and allocated balances */
        get: operations["get__portal_installments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your own payment receipts on accessible bookings */
        get: operations["get__portal_payments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Documents explicitly shared with you */
        get: operations["get__portal_documents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/documents/{id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download your shared document after a fresh access check */
        get: operations["get__portal_documents__id_download"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/documents/{id}/portal-visibility": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Explicitly share or withdraw a document from the customer portal */
        patch: operations["patch__projects__projectId_documents__id_portal_visibility"];
        trace?: never;
    };
    "/portal/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your booking workflow statuses without internal approval notes */
        get: operations["get__portal_requests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your customer account notifications */
        get: operations["get__portal_notifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/portal/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark your customer notification read */
        post: operations["post__portal_notifications__id_read"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/images": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload a private record image; JPEG, PNG or WebP up to 5 MiB */
        post: operations["post__images"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/images/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a short-lived image URL after checking record access */
        get: operations["get__images__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List assigned projects */
        get: operations["get__projects"];
        put?: never;
        /** Create project, account mappings and membership */
        post: operations["post__projects"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Project overview and setup progress */
        get: operations["get__projects__projectId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update project business rules */
        patch: operations["patch__projects__projectId"];
        trace?: never;
    };
    "/projects/{projectId}/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Save project payment settings */
        patch: operations["patch__projects__projectId_settings"];
        trace?: never;
    };
    "/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List users without credentials */
        get: operations["get__users"];
        put?: never;
        /** Create a user and assign roles and projects */
        post: operations["post__users"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user details by id */
        get: operations["get__users__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Activate or deactivate a user */
        patch: operations["patch__users__id"];
        trace?: never;
    };
    "/users/{id}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** View a user device session inventory */
        get: operations["get__users__id_sessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/revoke-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke all sessions for a user */
        post: operations["post__users__id_revoke_sessions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send user a password reset email */
        post: operations["post__users__id_reset_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Replace user roles and project access */
        post: operations["post__users__id_access"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/ledger": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get employee account statement and ledger transactions */
        get: operations["get__users__id_ledger"];
        put?: never;
        /** Create a new employee ledger voucher / transaction */
        post: operations["post__users__id_ledger"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/ledger/{entryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete an employee ledger entry */
        delete: operations["delete__users__id_ledger__entryId"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List roles and available permissions */
        get: operations["get__roles"];
        put?: never;
        /** Create an editable permission-based role */
        post: operations["post__roles"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Replace role permissions */
        patch: operations["patch__roles__id"];
        trace?: never;
    };
    "/projects/{projectId}/units": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search inventory availability */
        get: operations["get__projects__projectId_units"];
        put?: never;
        /** Create inventory unit */
        post: operations["post__projects__projectId_units"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/units/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Atomically import up to 500 inventory units */
        post: operations["post__projects__projectId_units_import"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/units/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Unit detail with price and status history */
        get: operations["get__projects__projectId_units__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update property details and up to five photos; price changes use the Change price action */
        patch: operations["patch__projects__projectId_units__id"];
        trace?: never;
    };
    "/projects/{projectId}/units/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Block or release uncommitted inventory */
        post: operations["post__projects__projectId_units__id_status"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/units/{id}/price": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Apply property price with history */
        post: operations["post__projects__projectId_units__id_price"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/customers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search customers by name, phone or authorized identity */
        get: operations["get__projects__projectId_customers"];
        put?: never;
        /** Create a customer and email automatically generated portal login credentials */
        post: operations["post__projects__projectId_customers"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/customers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Customer profile, nominees and historical property ownership */
        get: operations["get__projects__projectId_customers__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update non-identity customer contact details */
        patch: operations["patch__projects__projectId_customers__id"];
        trace?: never;
    };
    "/projects/{projectId}/customers/{id}/identity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reveal identity with audited access */
        get: operations["get__projects__projectId_customers__id_identity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/customers/{id}/nominees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add customer nominee */
        post: operations["post__projects__projectId_customers__id_nominees"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/installments/{id}/payment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Receive the next installment; approve cash or queue bank/cheque verification; requires Idempotency-Key */
        post: operations["post__projects__projectId_installments__id_payment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/payment-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List plans and immutable versions */
        get: operations["get__projects__projectId_payment_plans"];
        put?: never;
        /** Save payment plan defaults */
        post: operations["post__projects__projectId_payment_plans"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/payment-plans/{id}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update payment plan defaults without changing existing bookings */
        post: operations["post__projects__projectId_payment_plans__id_versions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List project bookings */
        get: operations["get__projects__projectId_bookings"];
        put?: never;
        /** Create a booking with a full payment or installment plan */
        post: operations["post__projects__projectId_bookings"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/bookings/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Booking with ownership history and payment position */
        get: operations["get__projects__projectId_bookings__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/bookings/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm booking */
        post: operations["post__projects__projectId_bookings__id_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/bookings/{id}/reschedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Save payment plan and retain paid installment history */
        post: operations["post__projects__projectId_bookings__id_reschedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List project collections */
        get: operations["get__projects__projectId_payments"];
        put?: never;
        /** Record pending payment; requires Idempotency-Key */
        post: operations["post__projects__projectId_payments"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/payments/{id}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Clear, reject or bounce payment; requires Idempotency-Key */
        post: operations["post__projects__projectId_payments__id_verify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/payments/{id}/allocate-advance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Allocate cleared excess credit to remaining installments */
        post: operations["post__projects__projectId_payments__id_allocate_advance"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/payments/{id}/reverse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reverse payment, receipt, allocations and journal atomically */
        post: operations["post__projects__projectId_payments__id_reverse"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/receipts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieve issued or reversed receipt */
        get: operations["get__projects__projectId_receipts__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/verify/file/{reference}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public computerized property file verification without sensitive customer data */
        get: operations["get__verify_file__reference"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/verify/employee/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public employee verification by employee ID or employee code */
        get: operations["get__verify_employee__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/verify/customer/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public customer verification by customer ID or customer code */
        get: operations["get__verify_customer__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/ndcs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List NDC records */
        get: operations["get__projects__projectId_ndcs"];
        put?: never;
        /** Request NDC after verifying identity, documents and dues */
        post: operations["post__projects__projectId_ndcs"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/ndcs/{id}/issue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Issue NDC with expiry */
        post: operations["post__projects__projectId_ndcs__id_issue"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/transfers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List ownership transfer history */
        get: operations["get__projects__projectId_transfers"];
        put?: never;
        /** Request full ownership transfer */
        post: operations["post__projects__projectId_transfers"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/transfers/{id}/verify-fee": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify and post transfer charge settlement */
        post: operations["post__projects__projectId_transfers__id_verify_fee"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/transfers/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Atomically transfer ownership and retain previous owners */
        post: operations["post__projects__projectId_transfers__id_complete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/transfers/{id}/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Withdraw unpaid pending transfer */
        post: operations["post__projects__projectId_transfers__id_withdraw"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/cancellations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List cancellations and staged refunds */
        get: operations["get__projects__projectId_cancellations"];
        put?: never;
        /** Request cancellation with explicit deduction and refund calculation */
        post: operations["post__projects__projectId_cancellations"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/cancellations/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Execute cancellation and release inventory */
        post: operations["post__projects__projectId_cancellations__id_complete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/cancellations/{id}/recalculate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Recalculate changed collections */
        post: operations["post__projects__projectId_cancellations__id_recalculate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/refunds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reserve a partial or complete refund amount */
        post: operations["post__projects__projectId_refunds"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/refunds/{id}/pay": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Pay refund and post balanced journal */
        post: operations["post__projects__projectId_refunds__id_pay"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/refunds/{id}/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Withdraw pending refund and release its reserved balance */
        post: operations["post__projects__projectId_refunds__id_withdraw"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/possessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List possessions, inspections and snags */
        get: operations["get__projects__projectId_possessions"];
        put?: never;
        /** Request possession after clearing dues */
        post: operations["post__projects__projectId_possessions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/possessions/{id}/inspection": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Record inspection and snag list */
        post: operations["post__projects__projectId_possessions__id_inspection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/snags/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resolve inspection snag */
        post: operations["post__projects__projectId_snags__id_resolve"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/possessions/{id}/handover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Complete handover after snag and dues checks */
        post: operations["post__projects__projectId_possessions__id_handover"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/transfers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get ownership case details */
        get: operations["get__projects__projectId_transfers__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/transfers/{id}/verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Review case documents */
        patch: operations["patch__projects__projectId_transfers__id_verification"];
        trace?: never;
    };
    "/projects/{projectId}/possessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get ownership case details */
        get: operations["get__projects__projectId_possessions__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/possessions/{id}/verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Review case documents */
        patch: operations["patch__projects__projectId_possessions__id_verification"];
        trace?: never;
    };
    "/projects/{projectId}/recovery-cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List recovery case history */
        get: operations["get__projects__projectId_recovery_cases"];
        put?: never;
        /** Assign recovery case to an authorized project user */
        post: operations["post__projects__projectId_recovery_cases"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/recovery-cases/{id}/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Log recovery contact, promise to pay or escalation */
        post: operations["post__projects__projectId_recovery_cases__id_activities"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/recovery-cases/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Close or reopen recovery case */
        patch: operations["patch__projects__projectId_recovery_cases__id"];
        trace?: never;
    };
    "/projects/{projectId}/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List chart of accounts */
        get: operations["get__projects__projectId_accounts"];
        put?: never;
        /** Add chart of account entry */
        post: operations["post__projects__projectId_accounts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/accounting-periods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List accounting periods and locks */
        get: operations["get__projects__projectId_accounting_periods"];
        put?: never;
        /** Create a non-overlapping accounting period */
        post: operations["post__projects__projectId_accounting_periods"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/accounting-periods/{id}/lock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Permanently close an accounting period */
        post: operations["post__projects__projectId_accounting_periods__id_lock"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/journals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List immutable journals and lines */
        get: operations["get__projects__projectId_journals"];
        put?: never;
        /** Post manual journal; immutable after posting */
        post: operations["post__projects__projectId_journals"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/journals/{id}/reverse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reverse a manual journal in the current open period */
        post: operations["post__projects__projectId_journals__id_reverse"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/bank-accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List registered bank accounts */
        get: operations["get__projects__projectId_bank_accounts"];
        put?: never;
        /** Register bank account against an asset ledger */
        post: operations["post__projects__projectId_bank_accounts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/bank-accounts/{id}/reconcile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Match a posted bank ledger line to a statement */
        post: operations["post__projects__projectId_bank_accounts__id_reconcile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/vendors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List project vendors */
        get: operations["get__projects__projectId_vendors"];
        put?: never;
        /** Register project vendor */
        post: operations["post__projects__projectId_vendors"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read append-only project audit trail */
        get: operations["get__projects__projectId_audit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List private document metadata */
        get: operations["get__projects__projectId_documents"];
        put?: never;
        /** Upload validated PDF, JPEG or PNG to private storage; 10 MiB maximum */
        post: operations["post__projects__projectId_documents"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/documents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete a document */
        delete: operations["delete__projects__projectId_documents__id"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all documents for an employee */
        get: operations["get__users__id_documents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}/documents/{documentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete an employee document */
        delete: operations["delete__users__id_documents__documentId"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/documents/{id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get audited short-lived private document download */
        get: operations["get__projects__projectId_documents__id_download"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/document-templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List versioned document templates */
        get: operations["get__projects__projectId_document_templates"];
        put?: never;
        /** Create plain-text PDF template; allowed variables use {{name}} syntax */
        post: operations["post__projects__projectId_document_templates"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/document-templates/{id}/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Queue a PDF document for an authorized booking */
        post: operations["post__projects__projectId_document_templates__id_generate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reconciled inventory, sales and collection KPIs; cache age at most 15 seconds */
        get: operations["get__projects__projectId_dashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Project-scoped operational or accounting report; maximum 1000 rows */
        get: operations["get__projects__projectId_reports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/reports/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Queue a private XLSX or PDF report export */
        post: operations["post__projects__projectId_reports_exports"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/jobs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read your own background job state */
        get: operations["get__projects__projectId_jobs__id"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/jobs/{id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get expiring private URL for your completed export */
        get: operations["get__projects__projectId_jobs__id_download"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List your in-app notification history */
        get: operations["get__notifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark your notification as read */
        post: operations["post__notifications__id_read"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * @description Exact decimal string; never a JSON floating point number.
         * @example 1250000.00
         */
        Money: string;
        Error: {
            /** @constant */
            success: false;
            error: {
                code: string;
                message: string;
                details?: unknown;
            };
            meta: {
                requestId?: string;
            };
        };
        User: {
            credentialsIssuedAt?: string | null;
            firstLoginAt?: string | null;
            photoId?: string | null;
            photo?: components["schemas"]["ImageAsset"] | null;
            id?: string;
            email?: string;
            name?: string;
            /** @enum {string} */
            accountType?: "STAFF" | "CUSTOMER";
            portalCustomers?: components["schemas"]["Customer"][];
            active?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            roles?: components["schemas"]["UserRole"][];
            projects?: components["schemas"]["UserProjectAccess"][];
            sessions?: components["schemas"]["Session"][];
            resets?: components["schemas"]["PasswordReset"][];
            devices?: components["schemas"]["Device"][];
            notifications?: components["schemas"]["Notification"][];
            documents?: components["schemas"]["Document"][];
            ledgerEntries?: components["schemas"]["EmployeeLedgerEntry"][];
        };
        Role: {
            id?: string;
            name?: string;
            permissions?: components["schemas"]["RolePermission"][];
            users?: components["schemas"]["UserRole"][];
        };
        Permission: {
            key?: string;
            roles?: components["schemas"]["RolePermission"][];
        };
        RolePermission: {
            roleId?: string;
            permissionKey?: string;
            role?: components["schemas"]["Role"];
            permission?: components["schemas"]["Permission"];
        };
        UserRole: {
            userId?: string;
            roleId?: string;
            user?: components["schemas"]["User"];
            role?: components["schemas"]["Role"];
        };
        UserProjectAccess: {
            userId?: string;
            projectId?: string;
            user?: components["schemas"]["User"];
            project?: components["schemas"]["Project"];
        };
        Session: {
            id?: string;
            userId?: string;
            platform?: string;
            deviceId?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            lastActivity?: string;
            /** Format: date-time */
            expiresAt?: string;
            revokedAt?: string | null;
            user?: components["schemas"]["User"];
            tokens?: components["schemas"]["RefreshToken"][];
        };
        RefreshToken: {
            id?: string;
            sessionId?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            expiresAt?: string;
            usedAt?: string | null;
            session?: components["schemas"]["Session"];
        };
        PasswordReset: {
            id?: string;
            userId?: string;
            /** Format: date-time */
            expiresAt?: string;
            usedAt?: string | null;
            user?: components["schemas"]["User"];
        };
        Device: {
            id?: string;
            userId?: string;
            installationId?: string;
            platform?: string;
            /** Format: date-time */
            updatedAt?: string;
            user?: components["schemas"]["User"];
        };
        Project: {
            location?: string;
            description?: string;
            features?: string[];
            featureImages?: unknown;
            photoIds?: string[];
            photoId?: string | null;
            photo?: components["schemas"]["ImageAsset"] | null;
            id?: string;
            code?: string;
            name?: string;
            currency?: string;
            timezone?: string;
            reservationMinutes?: number;
            downPaymentPercent?: components["schemas"]["Money"];
            graceDays?: number;
            ndcValidityDays?: number;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            access?: components["schemas"]["UserProjectAccess"][];
            units?: components["schemas"]["Unit"][];
            customers?: components["schemas"]["Customer"][];
            leads?: components["schemas"]["Lead"][];
            plans?: components["schemas"]["PaymentPlan"][];
            dealers?: components["schemas"]["Dealer"][];
            approvals?: components["schemas"]["Approval"][];
            policies?: components["schemas"]["ApprovalPolicy"][];
            accounts?: components["schemas"]["Account"][];
            periods?: components["schemas"]["AccountingPeriod"][];
            journals?: components["schemas"]["Journal"][];
            settings?: components["schemas"]["ProjectSetting"][];
            documents?: components["schemas"]["Document"][];
            templates?: components["schemas"]["DocumentTemplate"][];
            jobs?: components["schemas"]["BackgroundJob"][];
            banks?: components["schemas"]["BankAccount"][];
            vendors?: components["schemas"]["Vendor"][];
            employeeLedgers?: components["schemas"]["EmployeeLedgerEntry"][];
        };
        ProjectSetting: {
            projectId?: string;
            key?: string;
            value?: unknown;
            project?: components["schemas"]["Project"];
        };
        Unit: {
            photoIds?: string[];
            photoId?: string | null;
            photo?: components["schemas"]["ImageAsset"] | null;
            typeDetails?: string | null;
            featureImages?: unknown;
            id?: string;
            projectId?: string;
            number?: string;
            type?: string;
            phase?: string | null;
            block?: string | null;
            tower?: string | null;
            sector?: string | null;
            floor?: string | null;
            size?: components["schemas"]["Money"];
            measurementUnit?: string;
            features?: string[];
            price?: components["schemas"]["Money"];
            charges?: components["schemas"]["Money"];
            /** @enum {string} */
            status?: "AVAILABLE" | "RESERVED" | "BOOKED" | "SOLD" | "BLOCKED" | "TRANSFER_PENDING" | "POSSESSION_READY" | "POSSESSED";
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            project?: components["schemas"]["Project"];
            history?: components["schemas"]["UnitHistory"][];
            reservations?: components["schemas"]["Reservation"][];
            bookings?: components["schemas"]["Booking"][];
            allocations?: components["schemas"]["DealerAllocation"][];
        };
        UnitHistory: {
            id?: string;
            unitId?: string;
            actorId?: string;
            /** @enum {string} */
            status?: "AVAILABLE" | "RESERVED" | "BOOKED" | "SOLD" | "BLOCKED" | "TRANSFER_PENDING" | "POSSESSION_READY" | "POSSESSED";
            price?: components["schemas"]["Money"];
            charges?: components["schemas"]["Money"];
            reason?: string;
            /** Format: date-time */
            createdAt?: string;
            unit?: components["schemas"]["Unit"];
        };
        Customer: {
            identityType?: string;
            photoId?: string | null;
            photo?: components["schemas"]["ImageAsset"] | null;
            portalUserId?: string | null;
            portalUser?: components["schemas"]["User"] | null;
            portalInvitations?: components["schemas"]["CustomerInvitation"][];
            payments?: components["schemas"]["Payment"][];
            notifications?: components["schemas"]["Notification"][];
            id?: string;
            projectId?: string;
            reference?: string;
            name?: string;
            fatherName?: string | null;
            phone?: string;
            secondaryPhone?: string | null;
            email?: string | null;
            address?: string | null;
            identityLast4?: string;
            communicationConsent?: boolean;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            project?: components["schemas"]["Project"];
            contacts?: components["schemas"]["CustomerContact"][];
            nominees?: components["schemas"]["CustomerNominee"][];
            owners?: components["schemas"]["BookingOwner"][];
            reservations?: components["schemas"]["Reservation"][];
            bookings?: components["schemas"]["Booking"][];
            leads?: components["schemas"]["Lead"][];
            transfers?: components["schemas"]["Transfer"][];
            documents?: components["schemas"]["Document"][];
        };
        CustomerInvitation: {
            id?: string;
            customerId?: string;
            email?: string;
            /** Format: date-time */
            expiresAt?: string;
            usedAt?: string | null;
            revokedAt?: string | null;
            createdBy?: string;
            /** Format: date-time */
            createdAt?: string;
            customer?: components["schemas"]["Customer"];
        };
        CustomerContact: {
            id?: string;
            customerId?: string;
            kind?: string;
            value?: string;
            customer?: components["schemas"]["Customer"];
        };
        CustomerNominee: {
            id?: string;
            customerId?: string;
            name?: string;
            relationship?: string;
            phone?: string;
            customer?: components["schemas"]["Customer"];
        };
        Lead: {
            id?: string;
            projectId?: string;
            name?: string;
            phone?: string;
            source?: string;
            status?: string;
            assignedTo?: string | null;
            customerId?: string | null;
            dealerId?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            project?: components["schemas"]["Project"];
            customer?: components["schemas"]["Customer"] | null;
            dealer?: components["schemas"]["Dealer"] | null;
            activities?: components["schemas"]["LeadActivity"][];
        };
        LeadActivity: {
            id?: string;
            leadId?: string;
            kind?: string;
            notes?: string;
            scheduledAt?: string | null;
            amount?: components["schemas"]["Money"] | null;
            createdBy?: string;
            /** Format: date-time */
            createdAt?: string;
            lead?: components["schemas"]["Lead"];
        };
        Reservation: {
            id?: string;
            reference?: string;
            unitId?: string;
            customerId?: string;
            /** @enum {string} */
            status?: "ACTIVE" | "CONVERTED" | "EXPIRED" | "CANCELLED";
            /** Format: date-time */
            expiresAt?: string;
            createdBy?: string;
            /** Format: date-time */
            createdAt?: string;
            unit?: components["schemas"]["Unit"];
            customer?: components["schemas"]["Customer"];
            booking?: components["schemas"]["Booking"] | null;
        };
        PaymentPlan: {
            id?: string;
            projectId?: string;
            name?: string;
            /** Format: date-time */
            createdAt?: string;
            project?: components["schemas"]["Project"];
            versions?: components["schemas"]["PaymentPlanVersion"][];
        };
        PaymentPlanVersion: {
            id?: string;
            planId?: string;
            version?: number;
            schedule?: unknown;
            createdBy?: string;
            /** Format: date-time */
            createdAt?: string;
            plan?: components["schemas"]["PaymentPlan"];
            bookings?: components["schemas"]["Booking"][];
        };
        Booking: {
            paymentType?: string;
            paymentTerms?: unknown;
            id?: string;
            reference?: string;
            unitId?: string;
            customerId?: string;
            reservationId?: string | null;
            planVersionId?: string | null;
            dealerId?: string | null;
            /** @enum {string} */
            status?: "DRAFT" | "CONFIRMED" | "CANCELLED";
            basePrice?: components["schemas"]["Money"];
            charges?: components["schemas"]["Money"];
            discount?: components["schemas"]["Money"];
            total?: components["schemas"]["Money"];
            downPayment?: components["schemas"]["Money"];
            scheduleVersion?: number;
            createdBy?: string;
            approvedBy?: string | null;
            confirmedAt?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            unit?: components["schemas"]["Unit"];
            customer?: components["schemas"]["Customer"];
            reservation?: components["schemas"]["Reservation"] | null;
            planVersion?: components["schemas"]["PaymentPlanVersion"] | null;
            dealer?: components["schemas"]["Dealer"] | null;
            owners?: components["schemas"]["BookingOwner"][];
            installments?: components["schemas"]["Installment"][];
            payments?: components["schemas"]["Payment"][];
            revisions?: components["schemas"]["ScheduleRevision"][];
            recovery?: components["schemas"]["RecoveryCase"][];
            commissions?: components["schemas"]["DealerCommission"][];
            ndcs?: components["schemas"]["Ndc"][];
            transfers?: components["schemas"]["Transfer"][];
            cancellation?: components["schemas"]["Cancellation"] | null;
            possessions?: components["schemas"]["Possession"][];
            documents?: components["schemas"]["Document"][];
        };
        BookingOwner: {
            id?: string;
            bookingId?: string;
            customerId?: string;
            share?: components["schemas"]["Money"];
            /** Format: date-time */
            validFrom?: string;
            validTo?: string | null;
            booking?: components["schemas"]["Booking"];
            customer?: components["schemas"]["Customer"];
        };
        Installment: {
            id?: string;
            bookingId?: string;
            sequence?: number;
            version?: number;
            label?: string;
            /** Format: date-time */
            dueDate?: string;
            amount?: components["schemas"]["Money"];
            superseded?: boolean;
            booking?: components["schemas"]["Booking"];
            allocations?: components["schemas"]["PaymentAllocation"][];
        };
        ScheduleRevision: {
            id?: string;
            bookingId?: string;
            version?: number;
            reason?: string;
            approvedBy?: string;
            /** Format: date-time */
            createdAt?: string;
            booking?: components["schemas"]["Booking"];
        };
        Payment: {
            proofImageId?: string | null;
            proofImage?: components["schemas"]["ImageAsset"] | null;
            methodDetails?: string | null;
            payerId?: string;
            payer?: components["schemas"]["Customer"];
            id?: string;
            bookingId?: string;
            amount?: components["schemas"]["Money"];
            method?: string;
            /** Format: date-time */
            paidAt?: string;
            transactionReference?: string | null;
            receivingAccountId?: string;
            /** @enum {string} */
            status?: "PENDING" | "CLEARED" | "REJECTED" | "BOUNCED" | "REVERSED";
            receivedBy?: string;
            verifiedBy?: string | null;
            verifiedAt?: string | null;
            /** Format: date-time */
            createdAt?: string;
            booking?: components["schemas"]["Booking"];
            receivingAccount?: components["schemas"]["Account"];
            allocations?: components["schemas"]["PaymentAllocation"][];
            receipt?: components["schemas"]["Receipt"] | null;
            verifications?: components["schemas"]["PaymentVerification"][];
        };
        PaymentVerification: {
            id?: string;
            paymentId?: string;
            actorId?: string;
            /** @enum {string} */
            status?: "PENDING" | "CLEARED" | "REJECTED" | "BOUNCED" | "REVERSED";
            reason?: string;
            /** Format: date-time */
            createdAt?: string;
            payment?: components["schemas"]["Payment"];
        };
        PaymentAllocation: {
            id?: string;
            paymentId?: string;
            installmentId?: string;
            amount?: components["schemas"]["Money"];
            reversedAt?: string | null;
            payment?: components["schemas"]["Payment"];
            installment?: components["schemas"]["Installment"];
        };
        Receipt: {
            id?: string;
            reference?: string;
            paymentId?: string;
            /** Format: date-time */
            createdAt?: string;
            reversedAt?: string | null;
            payment?: components["schemas"]["Payment"];
        };
        RecoveryCase: {
            id?: string;
            bookingId?: string;
            assignedTo?: string;
            status?: string;
            /** Format: date-time */
            createdAt?: string;
            booking?: components["schemas"]["Booking"];
            activities?: components["schemas"]["RecoveryActivity"][];
        };
        RecoveryActivity: {
            id?: string;
            caseId?: string;
            kind?: string;
            notes?: string;
            promiseAmount?: components["schemas"]["Money"] | null;
            promiseDate?: string | null;
            createdBy?: string;
            /** Format: date-time */
            createdAt?: string;
            recoveryCase?: components["schemas"]["RecoveryCase"];
        };
        Dealer: {
            photoId?: string | null;
            photo?: components["schemas"]["ImageAsset"] | null;
            id?: string;
            projectId?: string;
            name?: string;
            phone?: string;
            active?: boolean;
            commissionPercent?: components["schemas"]["Money"];
            /** Format: date-time */
            createdAt?: string;
            project?: components["schemas"]["Project"];
            bookings?: components["schemas"]["Booking"][];
            leads?: components["schemas"]["Lead"][];
            commissions?: components["schemas"]["DealerCommission"][];
            allocations?: components["schemas"]["DealerAllocation"][];
        };
        DealerAllocation: {
            dealerId?: string;
            unitId?: string;
            /** Format: date-time */
            expiresAt?: string;
            dealer?: components["schemas"]["Dealer"];
            unit?: components["schemas"]["Unit"];
        };
        DealerCommission: {
            id?: string;
            dealerId?: string;
            bookingId?: string;
            amount?: components["schemas"]["Money"];
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
            settledAt?: string | null;
            paymentReference?: string | null;
            dealer?: components["schemas"]["Dealer"];
            booking?: components["schemas"]["Booking"];
        };
        ApprovalPolicy: {
            id?: string;
            projectId?: string;
            operation?: string;
            minimumAmount?: components["schemas"]["Money"];
            permissions?: string[];
            project?: components["schemas"]["Project"];
        };
        Approval: {
            id?: string;
            projectId?: string;
            operation?: string;
            entityId?: string;
            payload?: unknown;
            amount?: components["schemas"]["Money"];
            requestedBy?: string;
            permissions?: string[];
            level?: number;
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "REJECTED" | "CONSUMED";
            /** Format: date-time */
            createdAt?: string;
            project?: components["schemas"]["Project"];
            actions?: components["schemas"]["ApprovalAction"][];
        };
        ApprovalAction: {
            id?: string;
            approvalId?: string;
            actorId?: string;
            level?: number;
            decision?: string;
            comment?: string;
            /** Format: date-time */
            createdAt?: string;
            approval?: components["schemas"]["Approval"];
        };
        Ndc: {
            id?: string;
            reference?: string;
            bookingId?: string;
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
            identityVerified?: boolean;
            documentsVerified?: boolean;
            requestedBy?: string;
            issuedAt?: string | null;
            expiresAt?: string | null;
            booking?: components["schemas"]["Booking"];
            transfers?: components["schemas"]["Transfer"][];
        };
        Transfer: {
            id?: string;
            reference?: string;
            bookingId?: string;
            buyerId?: string;
            ndcId?: string | null;
            verification?: unknown | null;
            charges?: components["schemas"]["Money"];
            paidAt?: string | null;
            paymentReference?: string | null;
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
            requestedBy?: string;
            completedAt?: string | null;
            booking?: components["schemas"]["Booking"];
            buyer?: components["schemas"]["Customer"];
            ndc?: components["schemas"]["Ndc"] | null;
        };
        Cancellation: {
            id?: string;
            bookingId?: string;
            deduction?: components["schemas"]["Money"];
            refundable?: components["schemas"]["Money"];
            reason?: string;
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
            requestedBy?: string;
            completedAt?: string | null;
            booking?: components["schemas"]["Booking"];
            refunds?: components["schemas"]["Refund"][];
        };
        Refund: {
            id?: string;
            cancellationId?: string;
            amount?: components["schemas"]["Money"];
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
            requestedBy?: string;
            paidAt?: string | null;
            paymentReference?: string | null;
            cancellation?: components["schemas"]["Cancellation"];
        };
        Possession: {
            id?: string;
            bookingId?: string;
            /** @enum {string} */
            status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
            requestedBy?: string;
            inspectionAt?: string | null;
            inspectionNotes?: string | null;
            handoverAt?: string | null;
            verification?: unknown | null;
            handoverReference?: string | null;
            receivedByName?: string | null;
            snags?: components["schemas"]["Snag"][];
            booking?: components["schemas"]["Booking"];
        };
        Snag: {
            id?: string;
            possessionId?: string;
            description?: string;
            resolvedAt?: string | null;
            possession?: components["schemas"]["Possession"];
        };
        Account: {
            id?: string;
            projectId?: string;
            code?: string;
            name?: string;
            /** @enum {string} */
            type?: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
            active?: boolean;
            project?: components["schemas"]["Project"];
            lines?: components["schemas"]["JournalLine"][];
            payments?: components["schemas"]["Payment"][];
            banks?: components["schemas"]["BankAccount"][];
        };
        AccountingPeriod: {
            id?: string;
            projectId?: string;
            /** Format: date-time */
            startDate?: string;
            /** Format: date-time */
            endDate?: string;
            locked?: boolean;
            project?: components["schemas"]["Project"];
            journals?: components["schemas"]["Journal"][];
        };
        Journal: {
            id?: string;
            projectId?: string;
            periodId?: string;
            reference?: string;
            source?: string;
            sourceId?: string;
            description?: string;
            /** Format: date-time */
            postedAt?: string;
            createdBy?: string;
            reversalOfId?: string | null;
            /** Format: date-time */
            createdAt?: string;
            project?: components["schemas"]["Project"];
            period?: components["schemas"]["AccountingPeriod"];
            lines?: components["schemas"]["JournalLine"][];
            reversalOf?: components["schemas"]["Journal"] | null;
            reversal?: components["schemas"]["Journal"] | null;
        };
        JournalLine: {
            vendorId?: string | null;
            vendor?: components["schemas"]["Vendor"] | null;
            id?: string;
            journalId?: string;
            accountId?: string;
            debit?: components["schemas"]["Money"];
            credit?: components["schemas"]["Money"];
            journal?: components["schemas"]["Journal"];
            account?: components["schemas"]["Account"];
            reconciliations?: components["schemas"]["BankReconciliation"][];
        };
        BankAccount: {
            id?: string;
            projectId?: string;
            accountId?: string;
            name?: string;
            iban?: string;
            project?: components["schemas"]["Project"];
            account?: components["schemas"]["Account"];
            reconciliations?: components["schemas"]["BankReconciliation"][];
        };
        BankReconciliation: {
            id?: string;
            bankAccountId?: string;
            journalLineId?: string;
            statementReference?: string;
            /** Format: date-time */
            statementDate?: string;
            reconciledBy?: string;
            bankAccount?: components["schemas"]["BankAccount"];
            journalLine?: components["schemas"]["JournalLine"];
        };
        Vendor: {
            lines?: components["schemas"]["JournalLine"][];
            id?: string;
            projectId?: string;
            name?: string;
            phone?: string;
            project?: components["schemas"]["Project"];
        };
        Document: {
            allProjectCustomers?: boolean;
            portalVisible?: boolean;
            id?: string;
            projectId?: string;
            customerId?: string | null;
            bookingId?: string | null;
            userId?: string | null;
            key?: string;
            name?: string;
            mime?: string;
            size?: number;
            sha256?: string;
            uploadedBy?: string;
            /** Format: date-time */
            createdAt?: string;
            project?: components["schemas"]["Project"];
            customer?: components["schemas"]["Customer"] | null;
            booking?: components["schemas"]["Booking"] | null;
            user?: components["schemas"]["User"] | null;
        };
        EmployeeLedgerEntry: {
            id?: string;
            userId?: string;
            projectId?: string | null;
            /** Format: date-time */
            date?: string;
            reference?: string;
            type?: string;
            description?: string;
            debit?: components["schemas"]["Money"];
            credit?: components["schemas"]["Money"];
            paymentMethod?: string | null;
            status?: string;
            createdBy?: string;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            user?: components["schemas"]["User"];
            project?: components["schemas"]["Project"] | null;
        };
        DocumentTemplate: {
            id?: string;
            projectId?: string;
            name?: string;
            body?: string;
            version?: number;
            project?: components["schemas"]["Project"];
        };
        BackgroundJob: {
            id?: string;
            projectId?: string;
            createdBy?: string;
            kind?: string;
            payload?: unknown;
            /** @enum {string} */
            status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
            resultKey?: string | null;
            error?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
            project?: components["schemas"]["Project"];
        };
        Outbox: {
            processedAt?: string | null;
            id?: string;
            kind?: string;
            payload?: unknown;
            /** Format: date-time */
            createdAt?: string;
            dispatchedAt?: string | null;
        };
        Notification: {
            customerId?: string | null;
            recipient?: string | null;
            customer?: components["schemas"]["Customer"] | null;
            id?: string;
            userId?: string | null;
            title?: string;
            body?: string;
            channel?: string;
            readAt?: string | null;
            /** Format: date-time */
            createdAt?: string;
            user?: components["schemas"]["User"] | null;
            deliveries?: components["schemas"]["NotificationDelivery"][];
        };
        NotificationDelivery: {
            id?: string;
            notificationId?: string;
            success?: boolean;
            error?: string | null;
            /** Format: date-time */
            attemptedAt?: string;
            notification?: components["schemas"]["Notification"];
        };
        AuditLog: {
            id?: string;
            actorId?: string | null;
            projectId?: string | null;
            action?: string;
            entityId?: string | null;
            requestId?: string;
            data?: unknown;
            /** Format: date-time */
            createdAt?: string;
        };
        IdempotencyRecord: {
            key?: string;
            actorId?: string;
            operation?: string;
            requestHash?: string;
            response?: unknown;
            /** Format: date-time */
            createdAt?: string;
        };
        ReferenceCounter: {
            prefix?: string;
            value?: number;
        };
        ImageAsset: {
            id?: string;
            projectId?: string | null;
            uploadedBy?: string;
            purpose?: string;
            key?: string;
            name?: string;
            mime?: string;
            size?: number;
            /** Format: date-time */
            createdAt?: string;
            users?: components["schemas"]["User"][];
            projects?: components["schemas"]["Project"][];
            units?: components["schemas"]["Unit"][];
            dealers?: components["schemas"]["Dealer"][];
            customers?: components["schemas"]["Customer"][];
            payments?: components["schemas"]["Payment"][];
        };
        BookingPosition: {
            installments: (components["schemas"]["Installment"] & {
                paid: components["schemas"]["Money"];
                outstanding: components["schemas"]["Money"];
                lateDays: number;
                overdue: components["schemas"]["Money"];
            })[];
            collected: components["schemas"]["Money"];
            unallocated: components["schemas"]["Money"];
            outstanding: components["schemas"]["Money"];
            overdue: components["schemas"]["Money"];
        };
        EmployeeLedger: {
            employee: {
                id: string;
                name: string;
                email: string;
                active: boolean;
                roles: string[];
                createdAt: string;
            };
            metrics: {
                totalDebit: string;
                totalCredit: string;
                balance: string;
                entryCount: number;
            };
            entries: {
                id: string;
                date: string;
                reference: string;
                type: string;
                description: string;
                debit: string;
                credit: string;
                runningBalance: string;
                paymentMethod: string | null;
                status: string;
                projectId: string | null;
                projectName: string | null;
                createdAt: string;
            }[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get__compatibility: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            apiVersion: string;
                            minimumClientVersion: string;
                            platforms: string[];
                            onlineRequired: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__metrics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Prometheus metrics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email: string;
                    password: string;
                    deviceId?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            accessToken: string;
                            expiresIn: number;
                            /** Format: uuid */
                            sessionId: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            accessToken: string;
                            expiresIn: number;
                            /** Format: uuid */
                            sessionId: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_native_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email: string;
                    password: string;
                    deviceId?: string;
                    /** @enum {string} */
                    platform: "electron" | "android" | "ios";
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            accessToken: string;
                            expiresIn: number;
                            /** Format: uuid */
                            sessionId: string;
                            refreshToken?: string;
                            /** Format: date-time */
                            refreshExpiresAt?: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_native_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    refreshToken: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            accessToken: string;
                            expiresIn: number;
                            /** Format: uuid */
                            sessionId: string;
                            refreshToken?: string;
                            /** Format: date-time */
                            refreshExpiresAt?: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            loggedOut: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_logout_all: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            loggedOut: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__auth_me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            id: string;
                            name: string;
                            email: string;
                            /** @enum {string} */
                            accountType: "STAFF" | "CUSTOMER";
                            projects: {
                                projectId: string;
                            }[];
                            permissions: string[];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_change_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    currentPassword: string;
                    newPassword: string & (unknown & unknown & unknown);
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            changed: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_forgot_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            message: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__auth_reset_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    token: string;
                    password: string & (unknown & unknown & unknown);
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            changed: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__auth_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Session"][];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete__auth_sessions__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__devices: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    installationId: string;
                    /** @enum {string} */
                    platform: "electron" | "android" | "ios";
                    pushToken: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Device"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete__devices__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__portal_profile_photo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            mime: string;
                            size: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_account: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            email: string;
                            photoId: string | null;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_bookings__id_statement_download: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            url: string;
                            expiresIn: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__portal_activate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    token: string;
                    password: string & (unknown & unknown & unknown);
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            activated: boolean;
                            email: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_customers__id_portal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            status: string;
                            email: string | null;
                            expiresAt: string | null;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete__projects__projectId_customers__id_portal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_customers__id_portal_invite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            status: string;
                            email: string;
                            expiresAt: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_customers__id_portal_resend_credentials: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            queued: boolean;
                            email: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_profile: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                reference: string;
                                name: string;
                                phone: string;
                                email: string | null;
                                address: string | null;
                                project: {
                                    id: string;
                                    name: string;
                                    currency: string;
                                    timezone: string;
                                };
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_dashboard: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            accounts: {
                                bookings: number;
                                total: string;
                                paid: string;
                                outstanding: string;
                                overdue: string;
                                advanceCredit: string;
                                project: {
                                    id: string;
                                    name: string;
                                    currency: string;
                                    timezone: string;
                                };
                            }[];
                            asOf: string;
                            upcoming: {
                                id: string;
                                reference: string;
                                bookingId: string;
                                label: string;
                                dueDate: string;
                                outstanding: string;
                                currency: string;
                                projectName: string;
                            }[];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_bookings: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                reference: string;
                                status: string;
                                total: string;
                                downPayment: string;
                                createdAt: string;
                                confirmedAt: string | null;
                                unit: {
                                    number: string;
                                    type: string;
                                    phase: string | null;
                                    block: string | null;
                                    floor: string | null;
                                    size: string;
                                    measurementUnit: string;
                                    status: string;
                                    project: {
                                        id: string;
                                        name: string;
                                        currency: string;
                                        timezone: string;
                                    };
                                };
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_bookings__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            id: string;
                            reference: string;
                            status: string;
                            total: string;
                            downPayment: string;
                            createdAt: string;
                            confirmedAt: string | null;
                            unit: {
                                number: string;
                                type: string;
                                phase: string | null;
                                block: string | null;
                                floor: string | null;
                                size: string;
                                measurementUnit: string;
                                status: string;
                                project: {
                                    id: string;
                                    name: string;
                                    currency: string;
                                    timezone: string;
                                };
                            };
                            position: {
                                bookings: number;
                                total: string;
                                paid: string;
                                outstanding: string;
                                overdue: string;
                                advanceCredit: string;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_installments: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                bookingId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                label: string;
                                dueDate: string;
                                amount: string;
                                paid: string;
                                outstanding: string;
                                booking: {
                                    id: string;
                                    reference: string;
                                    status: string;
                                    total: string;
                                    downPayment: string;
                                    createdAt: string;
                                    confirmedAt: string | null;
                                    unit: {
                                        number: string;
                                        type: string;
                                        phase: string | null;
                                        block: string | null;
                                        floor: string | null;
                                        size: string;
                                        measurementUnit: string;
                                        status: string;
                                        project: {
                                            id: string;
                                            name: string;
                                            currency: string;
                                            timezone: string;
                                        };
                                    };
                                };
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_payments: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                bookingId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                amount: string;
                                method: string;
                                paidAt: string;
                                status: string;
                                booking: {
                                    id: string;
                                    reference: string;
                                    status: string;
                                    total: string;
                                    downPayment: string;
                                    createdAt: string;
                                    confirmedAt: string | null;
                                    unit: {
                                        number: string;
                                        type: string;
                                        phase: string | null;
                                        block: string | null;
                                        floor: string | null;
                                        size: string;
                                        measurementUnit: string;
                                        status: string;
                                        project: {
                                            id: string;
                                            name: string;
                                            currency: string;
                                            timezone: string;
                                        };
                                    };
                                };
                                receipt: {
                                    reference: string;
                                    createdAt: string;
                                    reversedAt: string | null;
                                } | null;
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_documents: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                bookingId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                name: string;
                                mime: string;
                                size: number;
                                createdAt: string;
                                bookingId: string | null;
                                project: {
                                    id: string;
                                    name: string;
                                    currency: string;
                                    timezone: string;
                                };
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_documents__id_download: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            url: string;
                            expiresIn: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_documents__id_portal_visibility: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    portalVisible: boolean;
                    allProjectCustomers?: boolean;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            updated: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_requests: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                bookingId?: string;
                kind?: "ndcs" | "transfers" | "refunds" | "possessions";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                reference?: string;
                                status: string;
                                booking: {
                                    id: string;
                                    reference: string;
                                    status: string;
                                    total: string;
                                    downPayment: string;
                                    createdAt: string;
                                    confirmedAt: string | null;
                                    unit: {
                                        number: string;
                                        type: string;
                                        phase: string | null;
                                        block: string | null;
                                        floor: string | null;
                                        size: string;
                                        measurementUnit: string;
                                        status: string;
                                        project: {
                                            id: string;
                                            name: string;
                                            currency: string;
                                            timezone: string;
                                        };
                                    };
                                };
                                issuedAt?: string | null;
                                expiresAt?: string | null;
                                completedAt?: string | null;
                                paidAt?: string | null;
                                inspectionAt?: string | null;
                                handoverAt?: string | null;
                                amount?: string;
                                charges?: string;
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__portal_notifications: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: {
                                id: string;
                                title: string;
                                body: string;
                                createdAt: string;
                                readAt: string | null;
                            }[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__portal_notifications__id_read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            read: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__images: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** @enum {string} */
                    purpose: "PROJECT" | "UNIT" | "FEATURE" | "CUSTOMER" | "USER" | "PAYMENT";
                    /** Format: uuid */
                    projectId?: string;
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            mime: string;
                            size: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__images__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: uri */
                            url: string;
                            expiresIn: number;
                            name: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Project"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    location: string;
                    /** @default  */
                    description?: string;
                    /** @default [] */
                    features?: string[];
                    /** @default [] */
                    featureImages?: {
                        feature: string;
                        /** Format: uuid */
                        imageId: string;
                    }[];
                    /** Format: uuid */
                    photoId?: string;
                    photoIds?: string[];
                    /** @default PKR */
                    currency?: string;
                    /** @default Asia/Karachi */
                    timezone?: string;
                    /** @default 30 */
                    ndcValidityDays?: number;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Project"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Project"] & {
                            availableProperties: number;
                            _count: {
                                units: number;
                                plans: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name?: string;
                    location?: string;
                    description?: string;
                    features?: string[];
                    featureImages?: {
                        feature: string;
                        /** Format: uuid */
                        imageId: string;
                    }[];
                    photoId?: string | null;
                    photoIds?: string[];
                    currency?: string;
                    timezone?: string;
                    ndcValidityDays?: number;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Project"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_settings: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    downPaymentPercent: string;
                    ndcValidityDays: number;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Project"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__users: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["User"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__users: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    /** Format: email */
                    email: string;
                    password: string & (unknown & unknown & unknown);
                    /** Format: uuid */
                    photoId: string;
                    roleIds: string[];
                    projectIds: string[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["User"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__users__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["User"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__users__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    active: boolean;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["User"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__users__id_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Session"][];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__users__id_revoke_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__users__id_reset_password: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            message: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__users__id_access: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    roleIds: string[];
                    projectIds: string[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            updated: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__users__id_ledger: {
        parameters: {
            query?: {
                from?: string;
                to?: string;
                projectId?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["EmployeeLedger"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__users__id_ledger: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    projectId?: string;
                    date?: string;
                    /**
                     * @default ADJUSTMENT
                     * @enum {string}
                     */
                    type?: "SALARY" | "COMMISSION" | "ADVANCE" | "EXPENSE_REIMBURSEMENT" | "BONUS" | "ALLOWANCE" | "DEDUCTION" | "PAYMENT" | "ADJUSTMENT";
                    reference?: string;
                    description: string;
                    /** @default 0 */
                    debit?: number;
                    /** @default 0 */
                    credit?: number;
                    /** @enum {string} */
                    paymentMethod?: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ADJUSTMENT" | "ONLINE";
                    /**
                     * @default POSTED
                     * @enum {string}
                     */
                    status?: "POSTED" | "PENDING" | "CANCELLED";
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["EmployeeLedgerEntry"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete__users__id_ledger__entryId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                entryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__roles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            roles: components["schemas"]["Role"][];
                            permissions: string[];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__roles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    permissions: ("projects.read" | "projects.create" | "projects.update" | "inventory.read" | "inventory.create" | "inventory.update" | "inventory.change_status" | "inventory.change_price" | "customers.read" | "customers.create" | "customers.update" | "customers.portal.manage" | "customers.view_sensitive" | "bookings.read" | "bookings.create" | "bookings.approve" | "bookings.cancel" | "plans.manage" | "payments.read" | "payments.create" | "payments.verify" | "payments.reverse" | "discounts.request" | "discounts.approve" | "recovery.manage" | "transfers.request" | "transfers.approve" | "ndc.request" | "ndc.approve" | "refunds.request" | "refunds.approve" | "possession.manage" | "possession.approve" | "finance.read" | "finance.post" | "finance.reverse" | "reports.read" | "reports.export" | "documents.read" | "documents.manage" | "users.manage" | "roles.manage" | "settings.manage" | "audit.read")[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Role"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__roles__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    permissions: ("projects.read" | "projects.create" | "projects.update" | "inventory.read" | "inventory.create" | "inventory.update" | "inventory.change_status" | "inventory.change_price" | "customers.read" | "customers.create" | "customers.update" | "customers.portal.manage" | "customers.view_sensitive" | "bookings.read" | "bookings.create" | "bookings.approve" | "bookings.cancel" | "plans.manage" | "payments.read" | "payments.create" | "payments.verify" | "payments.reverse" | "discounts.request" | "discounts.approve" | "recovery.manage" | "transfers.request" | "transfers.approve" | "ndc.request" | "ndc.approve" | "refunds.request" | "refunds.approve" | "possession.manage" | "possession.approve" | "finance.read" | "finance.post" | "finance.reverse" | "reports.read" | "reports.export" | "documents.read" | "documents.manage" | "users.manage" | "roles.manage" | "settings.manage" | "audit.read")[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            updated: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_units: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: "AVAILABLE" | "RESERVED" | "BOOKED" | "SOLD" | "BLOCKED" | "TRANSFER_PENDING" | "POSSESSION_READY" | "POSSESSED";
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
                phase?: string;
                type?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: (components["schemas"]["Unit"] & {
                                bookings?: {
                                    id?: string;
                                    reference?: string;
                                    status?: string;
                                    paymentType?: string;
                                    paymentStatus?: string;
                                    total?: components["schemas"]["Money"];
                                    collected?: components["schemas"]["Money"];
                                    outstanding?: components["schemas"]["Money"];
                                    unit?: {
                                        id: string;
                                        number: string;
                                    };
                                    customers?: {
                                        id: string;
                                        name: string;
                                    }[];
                                }[];
                            })[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_units: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    number: string;
                    /** @enum {string} */
                    type: "RESIDENTIAL_PLOT" | "COMMERCIAL_PLOT" | "APARTMENT" | "SHOP" | "OFFICE" | "OTHER";
                    typeDetails?: string;
                    /** Format: uuid */
                    photoId?: string;
                    photoIds?: string[];
                    /** @default [] */
                    featureImages?: {
                        feature: string;
                        /** Format: uuid */
                        imageId: string;
                    }[];
                    phase?: string;
                    block?: string;
                    tower?: string;
                    sector?: string;
                    floor?: string;
                    size: string;
                    /** @enum {string} */
                    measurementUnit: "marla" | "kanal" | "sq ft" | "sq yd" | "sq m" | "acre" | "hectare";
                    /** @default [] */
                    features?: string[];
                    price: string;
                    /** @default 0 */
                    charges?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Unit"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_units_import: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    units: {
                        number: string;
                        /** @enum {string} */
                        type: "RESIDENTIAL_PLOT" | "COMMERCIAL_PLOT" | "APARTMENT" | "SHOP" | "OFFICE" | "OTHER";
                        typeDetails?: string;
                        /** Format: uuid */
                        photoId?: string;
                        photoIds?: string[];
                        /** @default [] */
                        featureImages?: {
                            feature: string;
                            /** Format: uuid */
                            imageId: string;
                        }[];
                        phase?: string;
                        block?: string;
                        tower?: string;
                        sector?: string;
                        floor?: string;
                        size: string;
                        /** @enum {string} */
                        measurementUnit: "marla" | "kanal" | "sq ft" | "sq yd" | "sq m" | "acre" | "hectare";
                        /** @default [] */
                        features?: string[];
                        price: string;
                        /** @default 0 */
                        charges?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            imported: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_units__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Unit"] & {
                            bookings?: {
                                id?: string;
                                reference?: string;
                                status?: string;
                                paymentType?: string;
                                paymentStatus?: string;
                                total?: components["schemas"]["Money"];
                                collected?: components["schemas"]["Money"];
                                outstanding?: components["schemas"]["Money"];
                                unit?: {
                                    id: string;
                                    number: string;
                                };
                                customers?: {
                                    id: string;
                                    name: string;
                                }[];
                            }[];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_units__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    number?: string;
                    /** @enum {string} */
                    type?: "RESIDENTIAL_PLOT" | "COMMERCIAL_PLOT" | "APARTMENT" | "SHOP" | "OFFICE" | "OTHER";
                    typeDetails?: string;
                    photoId?: string | null;
                    photoIds?: string[];
                    featureImages?: {
                        feature: string;
                        /** Format: uuid */
                        imageId: string;
                    }[];
                    phase?: string;
                    block?: string;
                    tower?: string;
                    sector?: string;
                    floor?: string;
                    size?: string;
                    /** @enum {string} */
                    measurementUnit?: "marla" | "kanal" | "sq ft" | "sq yd" | "sq m" | "acre" | "hectare";
                    features?: string[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Unit"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_units__id_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    status: "AVAILABLE" | "BLOCKED";
                    reason: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Unit"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_units__id_price: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    price: string;
                    charges: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Unit"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_customers: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
                identity?: string;
                group?: "UNASSIGNED" | "INSTALLMENTS" | "FULLY_PAID" | "PENDING";
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: (components["schemas"]["Customer"] & {
                                bookings?: {
                                    id?: string;
                                    reference?: string;
                                    status?: string;
                                    paymentType?: string;
                                    paymentStatus?: string;
                                    total?: components["schemas"]["Money"];
                                    collected?: components["schemas"]["Money"];
                                    outstanding?: components["schemas"]["Money"];
                                    unit?: {
                                        id: string;
                                        number: string;
                                    };
                                    customers?: {
                                        id: string;
                                        name: string;
                                    }[];
                                }[];
                                paymentStatus?: string;
                            })[];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                            groups?: {
                                ALL: number;
                                UNASSIGNED: number;
                                INSTALLMENTS: number;
                                FULLY_PAID: number;
                                PENDING: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_customers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    fatherName?: string | null;
                    phone: string;
                    secondaryPhone?: string | null;
                    /** Format: email */
                    email: string;
                    address?: string | null;
                    photoId?: string | null;
                    identity: string;
                    /**
                     * @default CNIC
                     * @enum {string}
                     */
                    identityType?: "CNIC" | "PASSPORT";
                    /** @default false */
                    communicationConsent?: boolean;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Customer"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_customers__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Customer"] & {
                            bookings?: {
                                id?: string;
                                reference?: string;
                                status?: string;
                                paymentType?: string;
                                paymentStatus?: string;
                                total?: components["schemas"]["Money"];
                                collected?: components["schemas"]["Money"];
                                outstanding?: components["schemas"]["Money"];
                                unit?: {
                                    id: string;
                                    number: string;
                                };
                                customers?: {
                                    id: string;
                                    name: string;
                                }[];
                            }[];
                            paymentStatus?: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_customers__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name?: string;
                    fatherName?: string | null;
                    phone?: string;
                    secondaryPhone?: string | null;
                    email?: string | null;
                    address?: string | null;
                    photoId?: string | null;
                    /**
                     * @default CNIC
                     * @enum {string}
                     */
                    identityType?: "CNIC" | "PASSPORT";
                    /** @default false */
                    communicationConsent?: boolean;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Customer"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_customers__id_identity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            identity: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_customers__id_nominees: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    relationship: string;
                    phone: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["CustomerNominee"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_installments__id_payment: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    expectedAmount: string;
                    /** @enum {string} */
                    method: "CASH" | "CHEQUE" | "BANK_TRANSFER";
                    /** Format: date-time */
                    paidAt: string;
                    transactionReference?: string;
                    /** Format: uuid */
                    proofImageId?: string;
                    /** Format: uuid */
                    receivingAccountId?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Payment"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_payment_plans: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                search?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["PaymentPlan"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_payment_plans: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    /** @enum {string} */
                    paymentType: "FULL_PAYMENT" | "INSTALLMENTS";
                    downPayment?: string;
                    installmentCount?: number;
                    intervalMonths?: number;
                    /** Format: date */
                    firstInstallmentDate?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["PaymentPlan"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_payment_plans__id_versions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    paymentType: "FULL_PAYMENT" | "INSTALLMENTS";
                    downPayment?: string;
                    installmentCount?: number;
                    intervalMonths?: number;
                    /** Format: date */
                    firstInstallmentDate?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["PaymentPlanVersion"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_bookings: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: "DRAFT" | "CONFIRMED" | "CANCELLED";
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Booking"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_bookings: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    paymentType: "FULL_PAYMENT" | "INSTALLMENTS";
                    downPayment?: string;
                    installmentCount?: number;
                    intervalMonths?: number;
                    /** Format: date */
                    firstInstallmentDate?: string;
                    /** Format: uuid */
                    customerId: string;
                    /** Format: uuid */
                    unitId: string;
                    /** Format: uuid */
                    dealerId?: string;
                    sellingPrice?: string;
                    /** @default 0 */
                    discount?: string;
                    /** @default false */
                    confirm?: boolean;
                    owners?: {
                        /** Format: uuid */
                        customerId: string;
                        share: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            booking: components["schemas"]["Booking"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_bookings__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Booking"] & {
                            position: components["schemas"]["BookingPosition"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_bookings__id_confirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Booking"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_bookings__id_reschedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    reason: string;
                    installmentCount: number;
                    intervalMonths: number;
                    /** Format: date */
                    firstInstallmentDate: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BookingPosition"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_payments: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: "PENDING" | "CLEARED" | "REJECTED" | "BOUNCED" | "REVERSED";
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
                bookingId?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Payment"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_payments: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                    amount: string;
                    /** @enum {string} */
                    method: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "PAY_ORDER" | "ONLINE" | "OTHER";
                    /** Format: date-time */
                    paidAt: string;
                    transactionReference?: string;
                    /** Format: uuid */
                    proofImageId?: string;
                    methodDetails?: string;
                    /** Format: uuid */
                    receivingAccountId?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Payment"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_payments__id_verify: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    decision: "CLEARED" | "REJECTED" | "BOUNCED";
                    reason: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Payment"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_payments__id_allocate_advance: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Payment"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_payments__id_reverse: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    reason: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Payment"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_receipts__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Receipt"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__verify_file__reference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reference: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            valid: boolean;
                            reference: string;
                            verifiedAt: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__verify_employee__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            valid: boolean;
                            verifiedAt: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__verify_customer__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            valid: boolean;
                            verifiedAt: string;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_ndcs: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
                bookingId?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Ndc"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_ndcs: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                    identityVerified: boolean;
                    documentsVerified: boolean;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            ndc: components["schemas"]["Ndc"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_ndcs__id_issue: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Ndc"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_transfers: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
                bookingId?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Transfer"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_transfers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                    /** Format: uuid */
                    buyerId: string;
                    charges: string;
                    verification: {
                        authorityName: string;
                        documentsReference: string;
                        identityVerified: boolean;
                        ownershipVerified: boolean;
                        documentsVerified: boolean;
                        taxesAndFeesVerified: boolean;
                        /** @enum {string} */
                        clearanceStatus: "VERIFIED" | "NOT_REQUIRED";
                        clearanceReference?: string;
                        /** Format: date */
                        clearanceValidUntil?: string;
                        clearanceReason?: string;
                        consentVerified: boolean;
                    };
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            transfer: components["schemas"]["Transfer"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_transfers__id_verify_fee: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    accountId: string;
                    paymentReference: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Transfer"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_transfers__id_complete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Transfer"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_transfers__id_withdraw: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            cancelled: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_cancellations: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
                bookingId?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Cancellation"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_cancellations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                    deduction: string;
                    reason: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            cancellation: components["schemas"]["Cancellation"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_cancellations__id_complete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Cancellation"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_cancellations__id_recalculate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    deduction: string;
                    reason: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            cancellation: components["schemas"]["Cancellation"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_refunds: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    cancellationId: string;
                    amount: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            refund: components["schemas"]["Refund"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_refunds__id_pay: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    accountId: string;
                    paymentReference: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Refund"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_refunds__id_withdraw: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            cancelled: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_possessions: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                status?: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
                bookingId?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Possession"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_possessions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                    verification: {
                        authorityName: string;
                        documentsReference: string;
                        identityVerified: boolean;
                        ownershipVerified: boolean;
                        documentsVerified: boolean;
                        taxesAndFeesVerified: boolean;
                        /** @enum {string} */
                        clearanceStatus: "VERIFIED" | "NOT_REQUIRED";
                        clearanceReference?: string;
                        /** Format: date */
                        clearanceValidUntil?: string;
                        clearanceReason?: string;
                        possessionReleased: boolean;
                        sitePlanVerified: boolean;
                    };
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            possession: components["schemas"]["Possession"];
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_possessions__id_inspection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    notes: string;
                    snags: string[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Possession"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_snags__id_resolve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Snag"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_possessions__id_handover: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    handoverReference: string;
                    receivedByName: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Possession"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_transfers__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Transfer"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_transfers__id_verification: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    verification: {
                        authorityName: string;
                        documentsReference: string;
                        identityVerified: boolean;
                        ownershipVerified: boolean;
                        documentsVerified: boolean;
                        taxesAndFeesVerified: boolean;
                        /** @enum {string} */
                        clearanceStatus: "VERIFIED" | "NOT_REQUIRED";
                        clearanceReference?: string;
                        /** Format: date */
                        clearanceValidUntil?: string;
                        clearanceReason?: string;
                        consentVerified: boolean;
                    };
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Transfer"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_possessions__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Possession"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_possessions__id_verification: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    verification: {
                        authorityName: string;
                        documentsReference: string;
                        identityVerified: boolean;
                        ownershipVerified: boolean;
                        documentsVerified: boolean;
                        taxesAndFeesVerified: boolean;
                        /** @enum {string} */
                        clearanceStatus: "VERIFIED" | "NOT_REQUIRED";
                        clearanceReference?: string;
                        /** Format: date */
                        clearanceValidUntil?: string;
                        clearanceReason?: string;
                        possessionReleased: boolean;
                        sitePlanVerified: boolean;
                    };
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Possession"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_recovery_cases: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
                assignedTo?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["RecoveryCase"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_recovery_cases: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                    /** Format: uuid */
                    assignedTo: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["RecoveryCase"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_recovery_cases__id_activities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    kind: "CALL" | "NOTICE" | "PROMISE_TO_PAY" | "ESCALATION" | "NOTE";
                    notes: string;
                    promiseAmount?: string;
                    /** Format: date */
                    promiseDate?: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["RecoveryActivity"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch__projects__projectId_recovery_cases__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    status: "OPEN" | "CLOSED";
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["RecoveryCase"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_accounts: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Account"][];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_accounts: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    code: string;
                    name: string;
                    /** @enum {string} */
                    type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Account"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_accounting_periods: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["AccountingPeriod"][];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_accounting_periods: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: date */
                    startDate: string;
                    /** Format: date */
                    endDate: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["AccountingPeriod"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_accounting_periods__id_lock: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["AccountingPeriod"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_journals: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Journal"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_journals: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    description: string;
                    /** Format: date-time */
                    postedAt: string;
                    lines: {
                        /** Format: uuid */
                        accountId: string;
                        debit: string;
                        credit: string;
                        /** Format: uuid */
                        vendorId?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Journal"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_journals__id_reverse: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    reason: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Journal"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_bank_accounts: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BankAccount"][];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_bank_accounts: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    accountId: string;
                    name: string;
                    iban: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BankAccount"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_bank_accounts__id_reconcile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    journalLineId: string;
                    statementReference: string;
                    /** Format: date */
                    statementDate: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BankReconciliation"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_vendors: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                search?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Vendor"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_vendors: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    phone: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Vendor"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_audit: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["AuditLog"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_documents: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
                customerId?: string;
                bookingId?: string;
                userId?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Document"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_documents: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    name: string;
                    /** Format: uuid */
                    customerId?: string;
                    /** Format: uuid */
                    bookingId?: string;
                    /** Format: uuid */
                    userId?: string;
                    /**
                     * @default STAFF_ONLY
                     * @enum {string}
                     */
                    audience?: "STAFF_ONLY" | "SELECTED_CUSTOMER" | "ALL_PROJECT_CUSTOMERS";
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Document"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete__projects__projectId_documents__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__users__id_documents: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["Document"][];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete__users__id_documents__documentId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                documentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            revoked: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_documents__id_download: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: uri */
                            url: string;
                            expiresIn: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_document_templates: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                sort?: "asc" | "desc";
                search?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["DocumentTemplate"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_document_templates: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    body: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["DocumentTemplate"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_document_templates__id_generate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    bookingId: string;
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BackgroundJob"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_dashboard: {
        parameters: {
            query?: {
                phase?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: date-time */
                            asOf: string;
                            currency: string;
                            timezone: string;
                            totalProjects: number;
                            inventory: {
                                [key: string]: number;
                            };
                            totalInventory: number;
                            availableProperties: number;
                            bookedProperties: number;
                            soldProperties: number;
                            confirmedBookings: number;
                            netSales: components["schemas"]["Money"];
                            totalSalesValue: components["schemas"]["Money"];
                            verifiedCollections: components["schemas"]["Money"];
                            totalReceived: components["schemas"]["Money"];
                            outstanding: components["schemas"]["Money"];
                            totalOutstanding: components["schemas"]["Money"];
                            totalReceivables: components["schemas"]["Money"];
                            overdue: components["schemas"]["Money"];
                            overdueInstallments: number;
                            defaulterCount: number;
                            upcomingInstallments: number;
                            upcomingAmount: components["schemas"]["Money"];
                            activeDealers: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_reports: {
        parameters: {
            query: {
                kind: "sales" | "inventory" | "collections" | "installments" | "outstanding" | "ageing" | "defaulters" | "dealer-sales" | "customer-statement" | "cancellations" | "refunds" | "ndcs" | "transfers" | "possession" | "ledger" | "vendor-ledger" | "cash-book" | "bank-book" | "trial-balance" | "income-statement" | "balance-sheet";
                from?: string;
                to?: string;
                phase?: string;
                customerId?: string;
                bookingId?: string;
                accountId?: string;
                vendorId?: string;
                assignedTo?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            kind: string;
                            summary: {
                                [key: string]: string | boolean;
                            };
                            rows: {
                                [key: string]: string | number | boolean | null;
                            }[];
                            count: number;
                            currency: string;
                            statement?: {
                                project: {
                                    name: string;
                                    currency: string;
                                    timezone: string;
                                };
                                customer: {
                                    name: string;
                                    reference: string;
                                    email?: string | null;
                                    phone?: string | null;
                                };
                                /** Format: date-time */
                                generatedAt: string;
                                reference?: string;
                                from?: string;
                                to?: string;
                                metrics: {
                                    label: string;
                                    amount: components["schemas"]["Money"];
                                    emphasis?: boolean;
                                }[];
                                notes: string[];
                                sections: {
                                    title: string;
                                    description: string;
                                    columns: {
                                        key: string;
                                        label: string;
                                        width: number;
                                        /** @enum {string} */
                                        type?: "money" | "date" | "status";
                                    }[];
                                    rows: {
                                        [key: string]: string | null;
                                    }[];
                                }[];
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__projects__projectId_reports_exports: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    report: {
                        /** @enum {string} */
                        kind: "sales" | "inventory" | "collections" | "installments" | "outstanding" | "ageing" | "defaulters" | "dealer-sales" | "customer-statement" | "cancellations" | "refunds" | "ndcs" | "transfers" | "possession" | "ledger" | "vendor-ledger" | "cash-book" | "bank-book" | "trial-balance" | "income-statement" | "balance-sheet";
                        /** Format: date */
                        from?: string;
                        /** Format: date */
                        to?: string;
                        phase?: string;
                        /** Format: uuid */
                        customerId?: string;
                        /** Format: uuid */
                        bookingId?: string;
                        /** Format: uuid */
                        accountId?: string;
                        /** Format: uuid */
                        vendorId?: string;
                        /** Format: uuid */
                        assignedTo?: string;
                    };
                    /** @enum {string} */
                    format: "xlsx" | "pdf";
                };
            };
        };
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BackgroundJob"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_jobs__id: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: components["schemas"]["BackgroundJob"];
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__projects__projectId_jobs__id_download: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            /** Format: uri */
                            url: string;
                            expiresIn: number;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get__notifications: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                search?: string;
                status?: string;
                from?: string;
                to?: string;
                sort?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            items: components["schemas"]["Notification"][];
                            pagination: {
                                page: number;
                                limit: number;
                                total: number;
                                totalPages: number;
                            };
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post__notifications__id_read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful operation. Monetary model fields are decimal strings. Lists with pagination return items and pagination inside data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: true;
                        data: {
                            read: boolean;
                        };
                        meta: {
                            requestId: string;
                        };
                    };
                };
            };
            /** @description Malformed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid, expired or revoked session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission, origin or separation-of-duties denial */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Record missing or outside project scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Workflow, uniqueness or concurrency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation or business rule failure */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Distributed rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
