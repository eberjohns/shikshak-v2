"""merge_heads

Revision ID: 95a9109b3f88
Revises: 644eee7e592e, set_default_marks_for_existing
Create Date: 2025-10-19 14:51:49.428016

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '95a9109b3f88'
down_revision: Union[str, Sequence[str], None] = ('644eee7e592e', 'set_default_marks_for_existing')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
