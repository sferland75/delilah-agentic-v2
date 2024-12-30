"""Add error tracking

Revision ID: 002
Revises: 001
Create Date: 2024-12-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Create enum types
    op.execute("""
        CREATE TYPE error_severity AS ENUM (
            'low',
            'medium',
            'high',
            'critical'
        )
    """)
    
    op.execute("""
        CREATE TYPE error_category AS ENUM (
            'data_validation',
            'processing',
            'agent_failure',
            'database',
            'system',
            'network'
        )
    """)
    
    # Create error tracking table
    op.create_table(
        'error_tracking',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('error_message', sa.String(), nullable=False),
        sa.Column('category', sa.Enum('error_category'), nullable=False),
        sa.Column('severity', sa.Enum('error_severity'), nullable=False),
        sa.Column('context', postgresql.JSONB()),
        sa.Column('stack_trace', sa.Text()),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('resolved_at', sa.DateTime()),
        sa.Column('resolution_notes', sa.Text()),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id']),
    )
    
    # Create recovery attempts table
    op.create_table(
        'recovery_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('error_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('attempted_at', sa.DateTime(), nullable=False),
        sa.Column('strategy_used', sa.String(), nullable=False),
        sa.Column('successful', sa.Boolean(), nullable=False),
        sa.Column('notes', sa.Text()),
        sa.ForeignKeyConstraint(['error_id'], ['error_tracking.id']),
    )
    
    # Create indexes
    op.create_index(
        'idx_error_tracking_assessment',
        'error_tracking',
        ['assessment_id']
    )
    op.create_index(
        'idx_error_tracking_timestamp',
        'error_tracking',
        ['timestamp']
    )
    op.create_index(
        'idx_recovery_attempts_error',
        'recovery_attempts',
        ['error_id']
    )

def downgrade():
    op.drop_table('recovery_attempts')
    op.drop_table('error_tracking')
    op.execute('DROP TYPE error_severity')
    op.execute('DROP TYPE error_category')