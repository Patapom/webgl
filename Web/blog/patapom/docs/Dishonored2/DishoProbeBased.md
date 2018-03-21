# Probe-Based Lighting in the Game "Dishonored 2"

A lonely and mindboggling task!

Still not totally user-input-free at the time...


## Rendering Pipeline at Arkane

Forward rendering

Ward BRDF


## Probes

### Pros / Cons

At most 3000 probes per level

### Dynamic Lighting

### Dynamic Objects

### Pre-Computing

G-Buffer

Some of them used for specular

Runtime patches

Multiple bounces --> A probe for each patch


## Probes Network

### Delaunay?

### Voronoi!

#### Tetrahedrons

#### Queries

#### Open Cells


## The most Difficult Task

### Assign correct tetrahedron to each face!

Cost: 1 UINT per triangle!

### At Runtime

SH sampling in VS --> 4 colors sent to PS

Handling of translucent materials


## Specular Reflections

Barycentric coordinates on PC/Consoles

### Automatic plane fitting for parallax correction

