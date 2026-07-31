# Performance & Optimization

## Database Optimization
- **Indexes**: Essential indexes exist on the `User` and `*Profile` collections (e.g., `email`, `user`).
- **Text Search**: A text index exists on `Scholarship` (`scholarshipTitle` and `description`) to allow for highly optimized search queries via `$text`.
- **Query Optimization**: Most endpoints use `.select()` to exclude unnecessary fields. Passwords are set to `select: false` by default at the schema level.

## Frontend Optimization
- **Bundling**: Vite handles fast hot-module-replacement (HMR) and optimized production builds.
- **State Hydration**: React Context API is used to cache user state globally, preventing unnecessary API calls for basic user details on every render.

## Optimization Opportunities (Technical Debt)
1. **Pagination**: The `/api/scholarship/all` endpoint currently supports basic pagination, but complex queries involving location filters can be slow at scale.
2. **Caching**: Data that rarely changes (e.g., Province, District, Municipality lists) should be cached in Redis or at least in server memory, rather than querying MongoDB on every request.
3. **Database Denormalization**: Some queries use `populate()` heavily. It may be better to denormalize small strings (like `institutionName`) directly onto dependent documents to save database lookup time.
4. **Asset Loading**: Uploaded student documents are served directly from the Node.js process. This blocks the main thread. Static files should be offloaded to a CDN or AWS S3.
