# Database Architecture

[Previous content remains the same...]

## Development Guidelines

### Naming Conventions
1. Tables: plural, snake_case (e.g., clients, assessment_records)
2. Columns: singular, snake_case (e.g., first_name, created_at)
3. Indexes: idx_table_column (e.g., idx_clients_email)
4. Foreign keys: fk_table_reference (e.g., fk_assessments_client)

### Data Types
1. Use UUID for IDs
2. TIMESTAMP WITH TIME ZONE for all dates
3. JSONB for flexible data
4. VARCHAR with appropriate limits
5. ENUM types for fixed values

### Best Practices
1. Always include created_at/updated_at
2. Implement soft deletes with deleted_at
3. Use foreign key constraints
4. Implement check constraints
5. Use appropriate indexing

## Performance Optimization

### Query Optimization
```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM clients
WHERE status = 'active'
AND created_at > NOW() - INTERVAL '30 days';

-- Use appropriate indexes
CREATE INDEX idx_clients_status_created
ON clients(status, created_at)
WHERE deleted_at IS NULL;
```

### Connection Management
```python
# Using connection pooling
from psycopg_pool import ConnectionPool

pool = ConnectionPool(
    conninfo="postgresql://user:password@localhost:5432/dbname",
    min_size=5,
    max_size=20
)
```

### Caching Strategy
1. Application-level caching
2. Materialized views
3. Query result caching
4. Connection pooling

## Maintenance

### Regular Tasks
```sql
-- Vacuum analyze
VACUUM ANALYZE clients;
VACUUM ANALYZE assessments;

-- Update statistics
ANALYZE clients;
ANALYZE assessments;

-- Reindex
REINDEX TABLE clients;
REINDEX TABLE assessments;
```

### Monitoring Queries
```sql
-- Table sizes
SELECT
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_relation_size(relid)) as data_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as external_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Backup Strategy

### Daily Backups
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -Fc dbname > /backups/daily_${DATE}.dump

# Keep last 30 days
find /backups -name "daily_*.dump" -mtime +30 -delete
```

### Point-in-Time Recovery
```bash
# Base backup
pg_basebackup -D /backup/base -Ft -Xs -P

# Restore
pg_restore -d dbname /backups/daily_20241229.dump
```

## Disaster Recovery

### Recovery Steps
1. Stop application servers
2. Restore latest backup
3. Apply WAL files if needed
4. Verify data integrity
5. Update connection strings
6. Restart application servers

### Verification
```sql
-- Check data integrity
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM assessments;

-- Check recent modifications
SELECT * FROM clients
WHERE created_at > NOW() - INTERVAL '24 hours'
OR updated_at > NOW() - INTERVAL '24 hours';
```

## Security Measures

### Access Control
```sql
-- Create read-only role
CREATE ROLE readonly;
GRANT CONNECT ON DATABASE dbname TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

-- Create application role
CREATE ROLE app_user;
GRANT CONNECT ON DATABASE dbname TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
```

### Data Encryption
1. Use SSL for connections
2. Encrypt sensitive columns
3. Use pgcrypto for encryption functions
4. Implement column-level encryption where needed

## Migration Strategies

### Zero-Downtime Migration
1. Add new columns as nullable
2. Deploy code that handles both old and new
3. Backfill data
4. Make columns required
5. Remove old code

### Example Migration
```python
"""
Migration: Add email_verified column
Revision ID: abc123
"""

def upgrade():
    # Add column as nullable
    op.add_column('users',
        sa.Column('email_verified', sa.Boolean, nullable=True)
    )
    
    # Backfill data
    op.execute("""
        UPDATE users
        SET email_verified = false
        WHERE email_verified IS NULL
    """)
    
    # Make it non-nullable
    op.alter_column('users', 'email_verified',
        nullable=False
    )

def downgrade():
    op.drop_column('users', 'email_verified')
```

## Monitoring and Alerts

### Key Metrics
1. Connection count
2. Query duration
3. Cache hit ratio
4. Index usage
5. Table/index sizes

### Alert Thresholds
```sql
-- Long running queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > '5 minutes'::interval;

-- Connection count near max
SELECT count(*) as connection_count
FROM pg_stat_activity
WHERE count(*) > (SELECT setting::int * 0.8 
                 FROM pg_settings 
                 WHERE name = 'max_connections');
```

## Troubleshooting Guide

### Common Issues
1. Connection timeouts
2. Slow queries
3. Lock contention
4. High CPU usage
5. Disk space issues

### Diagnostic Queries
```sql
-- Find blocking queries
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocked_activity 
    ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity 
    ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## Future Improvements

### Planned Enhancements
1. Implement partitioning for large tables
2. Add materialized views for reporting
3. Implement better query optimization
4. Enhanced monitoring and alerting
5. Automated maintenance tasks

### Scale Considerations
1. Read replicas for reporting
2. Partition strategy for large tables
3. Archival strategy for old data
4. Caching strategy enhancement
5. Query optimization for scale