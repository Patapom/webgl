# Colored Penumbra Effect

This article is about this particular effect that can sometimes be detected in the penumbra regions of an image and that is often exagerated by artists,
 as can be seen in these beautiful paintings by [Piotr Jablonski](https://www.behance.net/gallery/16101045/TOMCAT):

![This](https://magazine.artstation.com/wp-content/uploads/2014/10/141006_PJ_Tomcat3.jpg)

![Piotr](https://magazine.artstation.com/wp-content/uploads/2014/10/141006_PJ_Tomcat1.jpg)


## Under the Skin

Shadow saturation is often quite visible when sub-surface scattering phenomenons are occurring, like skin or marble.
Intuitively you can imagine the saturation is coming from the many scattering events that occur beneath the skin or within the translucent material.

![Skin](images/ShadowColor/SaturationInTheMiddle.jpg)


## More Generally

It's quite natural to extrapolate and imagine the effect is also present whenever light encounters a very rough material, regardless of it being a metal, a dielectric, a translucent skin patch or even a strongly isotropically scattering gas.

![Groplan](images/ShadowColor/ShadowSaturation.jpg)

A simple explanation is that, assuming the surface/volume has an absorption albedo $\rho < 1$ and is lit by a radiance source $L_i$ then:

* A single rough reflection will yield the radiance $\propto\rho L_i$
* A second rough reflection will yield the radiance $\propto\rho^2 L_i$
* A third rough reflection will yield the radiance $\propto\rho^3 L_i$
* And so on...
* In a general manner, after N reflections, the radiance will be $\propto\rho^N L_i$

Thus, we have a [geometric series](http://mathworld.wolfram.com/GeometricSeries.html) and an ideally reflecting rough surface should give us:

$$
 L_o \propto L_i [\rho + \rho^2 + \rho^3 ...  + \rho^N ...]\\\\
 L_o \propto L_i \sum_{i=1}^\infty{\rho^i} \\\\
 L_o \propto L_i \left(\frac{\rho}{1-\rho}\right)
$$

This equation is, of course, entirely incorrect because it doesn't ensure energy conservation if $\rho > \frac{1}{2}$, as can be seen in this plot.

![plot](images/ShadowColor/InfiniteBounces.jpg)


Nonetheless, it helps us grasp the nature of the phenomenon.


## Conditions for Saturated Shadow

We can distinguish 2 cases:

### Distant Indirect Lighting

A strong direct light will produces a saturated *distant indirect lighting*

* The material needs no restriction on roughness

* The material needs to be quite bright and *possibly desaturated*

* The saturation comes from the distant reflected indirect lighting that brings the surface coloration

![rough](images/ShadowColor/SaturatedIndirectLight.jpg)

!!! note
    This case is not as spectacular as the second one since it will show a saturated ambient light, *not necessarily located only in the penumbra but in the full shadow as well*.


### A Rough Saturated Surface

A strong direct light will produce saturated penumbras if it scatters a lot through or at the surface of the material

* The material needs to be very rough or very anisotropic to scatter nearly in a diffuse manner.

* The material needs to be already quite saturated in order for the $\rho^N$ saturation to show

* The material needs to have a $\rho$ that is quite reflective (*i.e.* not a dark value) otherwise the saturation won't show as any successive bounce will quickly --> 0

![rough](images/ShadowColor/RoughSaturatedSurface.jpg)


### General Required Conditions

In both cases anyway, we need:

* A very strong direct lighting, so we can safely assume this is an outdoor effect that is only seen in bright Sunlight
* A very dark and desaturated ambient light when the surface is in full shadow, in opposition to the bright light
* A large penumbra transition zone for the effect to be sufficiently visible


## Simulation

The case of the rough saturated surfaces is the most interesting for us. It appears in the penumbra region simply because:

* In full shadow, only indirect lighting can be perceived as an almost uniform ambient light (saturated or not)
* In full sun light, the strong direct lighting completely burns the subtle saturation effect and we perceive the surface as white

In the penumbra, on the other hand, we have all the possible transition states between fully burnt-out predominant direct light, down to the fully washed-out ambient indirect light.
Within that small transition zone of the penumbra, the saturation comes in full effect.

!!! note ""
    ![saturation](images/ShadowColor/SaturationEffect.jpg)

    The effect of $k * \frac{\rho}{1-\rho}$ with $\rho=(0.9,0.8,0.3)$ for various values of surface reflectance $k$ and a light intensity of 10.<br/>
	**Top color gradients**: color saturation is enabled. **Bottom color gradients**: color saturation is disabled (*i.e.* regular diffuse lighting model)


The figure above shows the standard diffuse lighting equation:

$$
L_o = L_i \rho_d (\boldsymbol{\omega_i}\cdot\boldsymbol{n})
$$

With $L_i=10$ the incoming radiance, $\boldsymbol{\omega_i}$ the incoming light direction varying from 0 to more than 90° away from the surface normal $\boldsymbol{n}$.

And finally $\rho_d$ the diffuse [BRDF](BRDF) that we tweaked a little to incorporate our saturation term:

* When we use the regular diffuse BRDF $\rho_d = \frac{\rho}{\pi}$ we get the bottom gradients in the above figure.

* But if we use the new saturated term:
$$
\rho_d = \frac{\rho}{2 \pi (1-\rho)}
$$

    Then there is an additional energy term due to the multiply-scattered energy that is added back to the equation as well as a nice color saturation.


## Implementation

In order to have a physically plausible implementation of the color saturation, we need to make sure the saturation term is energy-conservative, meaning that we can't output more energy than we receive.

As we saw earlier, this is clearly the case for values of $\rho > 0.5$ and we had to introduce a $\frac{1}{2}$ factor in the $\rho_d$ diffuse BRDF to avoid that.


### Curve Fitting


[Improved Ambient Occlusion](https://drive.google.com/file/d/1SyagcEVplIm2KkRD3WQYSO9O0Iyi1hfy/view)


### Energy Compensation

Energy compensation term from the [Image Works](http://blog.selfshadow.com/publications/s2017-shading-course/#course_content) [^1] talk at Siggraph 2017:

We write the classical furnace test as:

$$
E(\boldsymbol{\omega_o}) = \int_{\Omega^+} f(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) (\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i
$$

Assuming the material has no absorption (*i.e.* perfectly specular), we expect $E(\boldsymbol{\omega_o}) = 1$ whatever the viewing direction, which is clearly almost never the case with BRDF models that consider only single scattering.

This comes from the [shadowing/masking](BRDF/BRDF%20Models/#shadowing-masking) that only removes energy without considering the inter-reflections between micro-facets that adds energy back.

Kulla et al. propose to re-introduce the missing energy through a compensation term to get the new BRDF expression:

$$
f_{ms}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) = \frac{ (1-E(\boldsymbol{\omega_o})) (1-E(\boldsymbol{\omega_i}))}{\pi (1-E_{avg})} \\\\
E_{avg} = \frac{1}{\pi} \int_{\Omega^+} E(\boldsymbol{\omega_i}) (\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i
$$



## Art Tutorials

!!! note ""
    ![Ball](images/ShadowColor/Ball.jpg)

    Figure 2.4. Glossy sphere under a single direct light source, showing terminology of light and shade. Photograph by David Briggs. [Source](http://www.huevaluechroma.com/022.php)

![Groplan](images/ShadowColor/SaturationExample.jpg)

From [https://androidarts.com/art_tut.htm#shadows](https://androidarts.com/art_tut.htm#shadows)

Classic Arts:

[http://www.art.net/~rebecca/ShadeDefinitions.html](http://www.art.net/~rebecca/ShadeDefinitions.html)

Pinterest with many interesting slides:

[https://www.pinterest.com/roqueromero/resources-lights-and-shadows-tuts/](https://www.pinterest.com/roqueromero/resources-lights-and-shadows-tuts/)


## References

[^1]: Kulla, C. Conty, A. 2017 ["Revisiting Physically Based Shading at Imageworks"](http://blog.selfshadow.com/publications/s2017-shading-course/imageworks/s2017_pbs_imageworks_slides.pdf)
