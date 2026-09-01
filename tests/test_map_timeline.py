"""
Basic smoke tests for the map/timeline service layer.
Run with: pytest tests/test_map_timeline.py
"""
from src.services.data_loader import load_heritage_data
from src.services.map_timeline_loader import load_map_timeline_data
from src.services.map_timeline_service import MapTimelineService


def _build_service():
    entities, _ = load_heritage_data("data/entities.json", "data/questions.json")
    map_data = load_map_timeline_data("data/map_timeline.json")
    return MapTimelineService(entities, map_data)


def test_get_entity_full_known_id():
    service = _build_service()
    result = service.get_entity_full("rama")
    assert result is not None
    assert result.canonical_name == "Rama"
    assert result.spatial_coordinates is not None
    assert len(result.timeline) > 0


def test_get_entity_full_unknown_id():
    service = _build_service()
    assert service.get_entity_full("not_a_real_id") is None


def test_get_pins_only_returns_entities_with_coords():
    service = _build_service()
    pins = service.get_pins()
    assert all(p.spatial_coordinates is not None for p in pins)


def test_get_nearby_sorted_by_distance():
    service = _build_service()
    # Point near Ayodhya — Rama should be very close
    nearby = service.get_nearby(lat=26.80, lng=82.20, radius_km=50)
    assert any(n.id == "rama" for n in nearby)
    if len(nearby) > 1:
        distances = [n.distance_km for n in nearby]
        assert distances == sorted(distances)


def test_flat_timeline_dated_events_sort_first():
    service = _build_service()
    flat = service.get_flat_timeline()
    dated = [e for e in flat if e.event.year_estimate is not None]
    if dated:
        years = [e.event.year_estimate for e in dated]
        assert years == sorted(years)