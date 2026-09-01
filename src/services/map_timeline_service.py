"""
Merges HeritageEntity records (loaded the same way akinator.py already
does, via the existing load_heritage_data) with the new map_timeline.json
records, and answers the map/timeline queries the API needs.
"""
import math
from typing import Dict, List, Optional

from src.schemas.entity import HeritageEntity
from src.schemas.map_timeline import (
    MapTimelineRecord,
    EntityMapTimelineResponse,
    MapPin,
    NearbyEntity,
    TimelineEventFlat,
)


class MapTimelineService:
    def __init__(self, entities: List[HeritageEntity], map_data: Dict[str, MapTimelineRecord]):
        self.entities_by_id = {e.id: e for e in entities}
        self.map_data = map_data

    def get_entity_full(self, entity_id: str) -> Optional[EntityMapTimelineResponse]:
        """This is the one the Akinator -> Map handoff calls the instant
        a guess is confirmed on the frontend."""
        entity = self.entities_by_id.get(entity_id)
        if entity is None:
            return None

        record = self.map_data.get(entity_id)
        coords = record.spatial_coordinates if record else None
        timeline = record.timeline if record else []

        return EntityMapTimelineResponse(
            id=entity.id,
            canonical_name=entity.canonical_name,
            category=entity.category,
            regional_name=entity.regional_name,
            source_text=entity.source_text,
            spatial_coordinates=coords,
            timeline=timeline,
        )

    def list_entities(self, category: Optional[str] = None) -> List[EntityMapTimelineResponse]:
        results = []
        for entity_id in self.entities_by_id:
            entity = self.entities_by_id[entity_id]
            if category and entity.category.lower() != category.lower():
                continue
            full = self.get_entity_full(entity_id)
            if full:
                results.append(full)
        return results

    def get_pins(self) -> List[MapPin]:
        """All entities that currently have coordinates — for the initial
        'show me everything on the map' render."""
        pins = []
        for entity_id, record in self.map_data.items():
            if record.spatial_coordinates is None:
                continue
            entity = self.entities_by_id.get(entity_id)
            if entity is None:
                continue
            pins.append(
                MapPin(
                    id=entity.id,
                    canonical_name=entity.canonical_name,
                    category=entity.category,
                    spatial_coordinates=record.spatial_coordinates,
                )
            )
        return pins

    @staticmethod
    def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Great-circle distance in km. Used for the 'click near a spot on
        the map -> sidebar list' feature."""
        R = 6371.0
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return 2 * R * math.asin(math.sqrt(a))

    def get_nearby(self, lat: float, lng: float, radius_km: float = 300.0) -> List[NearbyEntity]:
        """Given a lat/lng (from wherever the frontend maps a click on the
        stylized SVG shape back to a real coordinate), return every entity
        within radius_km, closest first. This powers the sidebar."""
        results = []
        for entity_id, record in self.map_data.items():
            if record.spatial_coordinates is None:
                continue
            entity = self.entities_by_id.get(entity_id)
            if entity is None:
                continue
            dist = self._haversine_km(
                lat, lng,
                record.spatial_coordinates.latitude,
                record.spatial_coordinates.longitude,
            )
            if dist <= radius_km:
                results.append(
                    NearbyEntity(
                        id=entity.id,
                        canonical_name=entity.canonical_name,
                        category=entity.category,
                        spatial_coordinates=record.spatial_coordinates,
                        distance_km=round(dist, 1),
                    )
                )
        results.sort(key=lambda x: x.distance_km)
        return results

    def get_flat_timeline(self, category: Optional[str] = None) -> List[TimelineEventFlat]:
        """All timeline events across all entities, sorted chronologically.
        Undated events (year_estimate is None) sort last rather than being
        guessed at — see Section 3.4 of the handoff doc: never invent a date."""
        flat = []
        for entity_id, record in self.map_data.items():
            entity = self.entities_by_id.get(entity_id)
            if entity is None:
                continue
            if category and entity.category.lower() != category.lower():
                continue
            for event in record.timeline:
                flat.append(
                    TimelineEventFlat(
                        entity_id=entity.id,
                        entity_name=entity.canonical_name,
                        category=entity.category,
                        event=event,
                    )
                )
        flat.sort(key=lambda x: (x.event.year_estimate is None, x.event.year_estimate or 0))
        return flat