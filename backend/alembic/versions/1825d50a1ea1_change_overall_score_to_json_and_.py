"""change_overall_score_to_json_and_preserve_values

Revision ID: 1825d50a1ea1
Revises: 2e1205ee2690
Create Date: 2025-10-19 15:51:07.199228

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1825d50a1ea1'
down_revision: Union[str, Sequence[str], None] = '2e1205ee2690'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema.

    Use ALTER TABLE ... USING to convert existing float values into jsonb arrays
    so the operation is atomic and avoids type mismatch errors.
    """
    # Convert column type using PostgreSQL USING clause to convert each float to JSONB array
    op.execute(
        "ALTER TABLE submissions ALTER COLUMN overall_score TYPE jsonb USING to_jsonb(ARRAY[overall_score, 0])"
    )


def downgrade() -> None:
    """Downgrade schema.

    Convert JSON arrays back to floats by keeping the earned marks (first element),
    then change the column type back to double precision.
    """
    op.execute(
        "ALTER TABLE submissions ALTER COLUMN overall_score TYPE double precision USING (overall_score->>0)::double precision"
    )
