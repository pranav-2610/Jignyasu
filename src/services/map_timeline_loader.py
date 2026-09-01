"""
Loads data/map_timeline.json — deliberately separate from
src/services/data_loader.py (which loads entities.json/questions.json
for the Akinator engine and is left untouched).
"""
import json
from typing import Dict
from src.schemas.map_timeline import MapTimelineRecord


def load_map_timeline_data(path: str) -> Dict[str, MapTimelineRecord]:
    """Returns a dict keyed by entity_id for O(1) lookups in the service layer."""
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    records: Dict[str, MapTimelineRecord] = {}
    for item in raw:
        record = MapTimelineRecord(**item)
        records[record.entity_id] = record
    return records