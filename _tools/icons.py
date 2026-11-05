"""Line icons for the calculator tiles (24x24, stroke = currentColor).

One drawing per calculator so the same picture never stands for two things.
The tile colour comes from the trade group (.ci.g-<group> in style.css).
"""

ICONS = {
    # Measure
    "area": '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 11 11 4M4 17 17 4M10 20 20 10M16 20l4-4"/>',
    "volume": '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    "linear": '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
    "perimeter": '<path d="M4 3v18h17"/><path d="M7 3v15h14"/><path d="M4 21l3-3"/>',
    # Walls, ceilings & paint
    "wall-area": '<rect x="3" y="4" width="18" height="16" rx="1"/><rect x="8" y="8" width="7" height="7"/><path d="M11.5 8v7M8 11.5h7"/>',
    "paint": '<rect x="3" y="3" width="14" height="6" rx="1.5"/><path d="M17 6h3v5h-8v3"/><rect x="10.5" y="14" width="3" height="7" rx="1"/>',
    "plaster": '<path d="M3 15h13l5-5H8z"/><path d="M11 15v2.5M8.5 20.5h5M11 17.5v3"/>',
    "drywall": '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M12 3v18"/><circle cx="7" cy="7" r=".6"/><circle cx="7" cy="17" r=".6"/><circle cx="17" cy="7" r=".6"/><circle cx="17" cy="17" r=".6"/>',
    "insulation": '<path d="M3 4h18M3 20h18"/><path d="M4 17 6.7 7l2.6 10L12 7l2.7 10 2.6-10L20 17"/>',
    # Floors & tiles
    "tiles": '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    "flooring": '<circle cx="7" cy="8" r="4"/><circle cx="7" cy="8" r="1.4"/><path d="M11 8h10v11H5v-7"/>',
    "paving": '<path d="M5 21 8 3h8l3 18z"/><path d="M6.5 12h11M5.8 16.5h12.4M7.3 7.5h9.4M12 3v18"/>',
    # Concrete, masonry & steel
    "concrete": '<rect x="3" y="7" width="18" height="11" rx="1.5"/><circle cx="7.5" cy="11" r="1"/><circle cx="12.5" cy="14.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/><circle cx="9" cy="15" r=".7"/><circle cx="17.5" cy="15" r=".7"/>',
    "round-column": '<ellipse cx="12" cy="5" rx="6" ry="2.5"/><path d="M6 5v14c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5"/>',
    "bricks": '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9.3h18M3 14.7h18M9 4v5.3M15 4v5.3M6 9.3v5.4M12 9.3v5.4M18 9.3v5.4M9 14.7V20M15 14.7V20"/>',
    "steel": '<path d="M5 4h14v3h-5v10h5v3H5v-3h5V7H5z"/>',
    "drilling": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    # Wood, roof & stairs
    "wood": '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M6 11c3-1.5 6 1.5 9 0 1.5-.7 2.5-.6 3 0M6 14c3 1 7-1 12 0"/>',
    "sheets": '<path d="M4 8l8-4 8 4-8 4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>',
    "roof": '<path d="M2.5 12.5 12 4l9.5 8.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
    "stairs": '<path d="M3 20h5v-4h4v-4h4V8h5V4"/>',
    # Garden, ground & water
    "fence": '<path d="M4 21V7l1.5-2.5L7 7v14M10.5 21V7L12 4.5 13.5 7v14M17 21V7l1.5-2.5L20 7v14"/><path d="M2 11h20M2 17h20"/>',
    "excavation": '<path d="M14 4l6 6M17 7l-6.5 6.5"/><path d="M7 12.5l4.5 4.5-3 3H5a2 2 0 0 1-2-2v-3.5z"/>',
    "tank": '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M5 12c2.3 1.2 4.7 1.2 7 0s4.7-1.2 7 0"/>',
    # Money & tools
    "cost": '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    "converter": '<path d="M4 8h15l-3.5-3.5M20 16H5l3.5 3.5"/>',
    "level": '<rect x="2" y="8.5" width="20" height="7" rx="2"/><rect x="8.5" y="10.5" width="7" height="3" rx="1.5"/><path d="M12 10.5v3"/>',
    "ruler": '<path d="M3 17 17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l1.5 1.5M13 7l2 2"/>',
}


def svg(name):
    return ('<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" '
            'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            + ICONS[name] + "</svg>")
