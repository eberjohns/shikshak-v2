"""set default marks for existing questions

Revision ID: set_default_marks_for_existing
Revises: 79420480f904
Create Date: 2025-10-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

# revision identifiers, used by Alembic.
revision: str = 'set_default_marks_for_existing'
down_revision: Union[str, None] = '79420480f904'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Only run the update if the 'marks' column actually exists.
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if 'questions' in inspector.get_table_names():
        cols = [c['name'] for c in inspector.get_columns('questions')]
        if 'marks' in cols:
            # Create a temp table reference and update rows where marks is NULL
            questions = table('questions',
                column('marks', sa.Float)
            )
            op.execute(
                questions.update().where(questions.c.marks.is_(None)).values(marks=1)
            )
        else:
            # marks column not present yet; skip
            pass
    else:
        # questions table not present; nothing to do
        pass

def downgrade() -> None:
    pass  # We don't want to undo setting default marks