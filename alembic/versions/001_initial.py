"""Initial database schema

Revision ID: 001
Revises: 
Create Date: 2024-12-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create enum types
    op.execute("""
        CREATE TYPE assessment_status AS ENUM (
            'intake',
            'processing',
            'analysis',
            'documentation',
            'completed',
            'error'
        )
    """)

    # Create tables
    op.create_table(
        'clients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('external_id', sa.String(), unique=True),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('date_of_birth', sa.DateTime(), nullable=False),
        sa.Column('contact_info', postgresql.JSONB(), nullable=False),
        sa.Column('medical_record', postgresql.JSONB()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )

    op.create_table(
        'therapists',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('external_id', sa.String(), unique=True),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('credentials', postgresql.JSONB(), nullable=False),
        sa.Column('specialties', postgresql.JSONB()),
        sa.Column('contact_info', postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )

    op.create_table(
        'assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('therapist_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Enum('assessment_status'), nullable=False),
        sa.Column('assessment_type', sa.String(), nullable=False),
        sa.Column('intake_date', sa.DateTime(), nullable=False),
        sa.Column('completion_date', sa.DateTime()),
        sa.Column('current_stage', sa.String()),
        sa.Column('metadata', postgresql.JSONB()),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id']),
        sa.ForeignKeyConstraint(['therapist_id'], ['therapists.id']),
    )

    op.create_table(
        'assessment_stages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('stage_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('started_at', sa.DateTime()),
        sa.Column('completed_at', sa.DateTime()),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True)),
        sa.Column('output_data', postgresql.JSONB()),
        sa.Column('error_message', sa.String()),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id']),
    )

    op.create_table(
        'assessment_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('metadata', postgresql.JSONB()),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id']),
    )

    # Create indexes
    op.create_index('idx_assessments_status', 'assessments', ['status'])
    op.create_index('idx_assessments_client', 'assessments', ['client_id'])
    op.create_index('idx_assessments_therapist', 'assessments', ['therapist_id'])
    op.create_index('idx_assessment_stages_assessment', 'assessment_stages', ['assessment_id'])
    op.create_index('idx_assessment_documents_assessment', 'assessment_documents', ['assessment_id'])

def downgrade():
    op.drop_table('assessment_documents')
    op.drop_table('assessment_stages')
    op.drop_table('assessments')
    op.drop_table('therapists')
    op.drop_table('clients')
    op.execute('DROP TYPE assessment_status')