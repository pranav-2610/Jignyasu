"""
Cultural Map & Timeline API.

Reuses the existing load_heritage_data() from src/services/data_loader.py
(same function akinator.py already calls) so entities.json is only ever
parsed with the one function that already knows its shape. Nothing here
touches akinator.py or its router.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from src.services.data_loader import load_heritage_data
from src.services.map_timeline_loader import load_map_timeline_data
from src.services.map_timeline_service import MapTimelineService

router = APIRouter(prefix="/api/v1")

# Loaded once at import time, same pattern as src/routers/akinator.py
entities, _questions = load_heritage_data("data/entities.json", "data/questions.json")
map_data = load_map_timeline_data("data/map_timeline.json")
service = MapTimelineService(entities, map_data)


@router.get("/entities/{entity_id}")
def get_entity(entity_id: str):
    """
    The Akinator -> Map handoff endpoint. Called the instant the guessing
    game confirms a prediction, with entity.id from the akinator response.
    Returns exactly the shape MapTimeline.jsx already expects.
    """
    result = service.get_entity_full(entity_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No entity found with id '{entity_id}'")
    return result


@router.get("/entities")
def list_entities(category: Optional[str] = Query(None, description="e.g. Character, Monument, Festival")):
    """Browse endpoint — for a future 'browse the map without playing the game' view."""
    return service.list_entities(category=category)


@router.get("/map/pins")
def get_map_pins():
    """All entities with known coordinates, for rendering every marker on
    the map at once (e.g. an initial 'explore mode' before any guess)."""
    return service.get_pins()


@router.get("/map/nearby")
def get_nearby(
    lat: float = Query(..., description="Latitude of the clicked point"),
    lng: float = Query(..., description="Longitude of the clicked point"),
    radius_km: float = Query(300.0, description="Search radius in km"),
):
    """
    Click-a-spot-on-the-map -> sidebar list feature. Frontend maps a click
    on the stylized SVG shape back to an approximate real lat/lng (inverse
    of the same projection MapTimeline.jsx already uses to place pins),
    then calls this to get everyone associated with that area.
    """
    return service.get_nearby(lat=lat, lng=lng, radius_km=radius_km)


@router.get("/timeline")
def get_timeline(category: Optional[str] = Query(None)):
    """Flattened, chronologically-sorted timeline across all entities —
    for a future standalone timeline browser, independent of the game."""
    return service.get_flat_timeline(category=category)