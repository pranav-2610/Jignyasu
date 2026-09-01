"""
Schemas for the Cultural Map & Timeline feature.

Deliberately kept SEPARATE from src/schemas/entity.py instead of adding
`timeline` onto HeritageEntity there. The handoff doc suggested extending
HeritageEntity directly — but that would mean editing an existing file,
which we're avoiding here. Instead, this module defines its own
GeoCoordinate/TimelineEvent and a response model that MERGES data from
HeritageEntity (via the existing akinator data loader) with a new,
separate map_timeline.json file at request time. See
map_timeline_service.py for the merge logic.

The field names on EntityMapTimelineResponse match exactly what
MapTimeline.jsx already expects (Section 2.5 of the handoff doc):
    entity.spatial_coordinates = { name, latitude, longitude } | null
    entity.timeline             = [ TimelineEvent, ... ]
"""
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class GeoCoordinate(BaseModel):
    """Same shape as entity.py's GeoCoordinate — redefined here on purpose
    so this module never has to import from entity.py."""
    name: str
    latitude: float
    longitude: float


class TimelineEvent(BaseModel):
    label: str                              # e.g. "Composed", "Born", "Coronation"
    era: str                                # display string, e.g. "c. 300 BCE" or "12th century CE"
    year_estimate: Optional[int] = None     # signed int (negative = BCE) for sorting; None if genuinely unknown
    description: Optional[str] = None
    source: Optional[str] = None            # which text/tradition this event comes from
    region: Optional[str] = None            # which regional version this is, when traditions disagree
                                             # (e.g. "North Indian" vs "South Indian") — leave unset when
                                             # there's no regional dispute for that event


class MapTimelineRecord(BaseModel):
    """One row of data/map_timeline.json. `entity_id` must match an id
    that already exists in data/entities.json — the loader does not
    validate this at load time (kept lightweight), but the merge in
    map_timeline_service.py silently skips ids with no matching entity."""
    entity_id: str
    spatial_coordinates: Optional[GeoCoordinate] = None
    timeline: List[TimelineEvent] = Field(default_factory=list)


class EntityMapTimelineResponse(BaseModel):
    """Full shape returned by GET /api/v1/entities/{entity_id}.
    Mirrors HeritageEntity's public fields + adds spatial_coordinates/timeline."""
    id: str
    canonical_name: str
    category: str
    regional_name: Dict[str, str] = Field(default_factory=dict)
    source_text: List[str] = Field(default_factory=list)
    spatial_coordinates: Optional[GeoCoordinate] = None
    timeline: List[TimelineEvent] = Field(default_factory=list)


class MapPin(BaseModel):
    """Lightweight shape for rendering all markers on the map at once."""
    id: str
    canonical_name: str
    category: str
    spatial_coordinates: GeoCoordinate


class NearbyEntity(BaseModel):
    """Used for the 'click a spot on the map -> sidebar list' feature."""
    id: str
    canonical_name: str
    category: str
    spatial_coordinates: GeoCoordinate
    distance_km: float


class TimelineEventFlat(BaseModel):
    """One event in the cross-entity flattened timeline view."""
    entity_id: str
    entity_name: str
    category: str
    event: TimelineEvent