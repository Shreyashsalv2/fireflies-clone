"""Action item CRUD (create nested under a meeting; update/delete by id)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import models, schemas
from ..database import get_session

router = APIRouter(prefix="/api", tags=["action-items"])


@router.post(
    "/meetings/{meeting_id}/action-items",
    response_model=schemas.ActionItemRead,
    status_code=201,
)
def add_action_item(
    meeting_id: int,
    payload: schemas.ActionItemCreate,
    session: Session = Depends(get_session),
):
    meeting = session.get(models.Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    item = models.ActionItem(
        meeting_id=meeting_id,
        text=payload.text,
        assignee=payload.assignee,
        due_date=payload.due_date,
        completed=payload.completed,
        order_index=len(meeting.action_items),
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.patch("/action-items/{item_id}", response_model=schemas.ActionItemRead)
def update_action_item(
    item_id: int,
    payload: schemas.ActionItemUpdate,
    session: Session = Depends(get_session),
):
    item = session.get(models.ActionItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Action item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/action-items/{item_id}", status_code=204)
def delete_action_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(models.ActionItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Action item not found")
    session.delete(item)
    session.commit()
