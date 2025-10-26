"""set_default_marks_for_existing_questions

Revision ID: 2e1205ee2690
Revises: 95a9109b3f88
Create Date: 2025-10-19 14:52:00.649234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e1205ee2690'
down_revision: Union[str, Sequence[str], None] = '95a9109b3f88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Set default value for existing records where marks is NULL
    op.execute("UPDATE questions SET marks = 1 WHERE marks IS NULL")
    
    # Make marks column non-nullable with default value
    op.alter_column('questions', 'marks',
                    existing_type=sa.INTEGER(),
                    nullable=False,
                    server_default='1')


def downgrade() -> None:
    # Make marks column nullable again and remove default value
    op.alter_column('questions', 'marks',
                    existing_type=sa.INTEGER(),
                    nullable=True,
                    server_default=None)
