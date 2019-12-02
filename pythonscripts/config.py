import numpy as np
QUAD_COORDS_UPPER = {
    "lonlat": np.array([
        [51.538444, -0.102410], # corner of back telephone box
        [51.538615, -0.102251], # far bus stop marking
        [51.538229, -0.102508], # Post in front left
        [51.538191, -0.102353] # Corner of dashed line bottom right
    ]),
    "pixel": np.array([
        [131, 80],
        [213, 32],
        [25, 217],
        [342, 281]
    ])
}

QUAD_COORDS_CAMDEN = {
    "lonlat": np.array([
        [51.541797, -0.138275], # back left
        [51.541950, -0.138383], # back right
        [51.542492, -0.137613], # front left
        [51.542511, -0.137823] # front right
    ]),
    "pixel": np.array([
        [97, 86],
        [185, 96],
        [63, 246],
        [328, 211]
    ])
}

BAY_ZONE_UPPER = [[51.538200, -0.102517], [51.538732, -0.102331]]

BAY_ZONE_CAMDEN = [[51.542214, -0.138113], [51.542503, -0.137794]]


PIC_URL_UPPER = "road.jpg"

PIC_URL_CAMDEN = "road.jpg"
