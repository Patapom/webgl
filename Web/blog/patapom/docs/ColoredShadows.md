# Colored Shadow Border Effect

This article is about this particular effect that can sometimes be detected in the penumbra regions of an image and that is often exagerated by artists,
 as can be seen in these beautiful example drawings by [Piotr Jablonski](https://www.behance.net/gallery/16101045/TOMCAT):

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

* A single diffuse reflection will yield the radiance $\rho L_i$
* A second diffuse reflection will yield the radiance $\rho^2 L_i$
* A third diffuse reflection will yield the radiance $\rho^3 L_i$
* And so on...
* In a general manner, after N reflections, the radiance will be $\rho^N L_i$

Thus, an ideally reflecting surface should give us:

$$
 L_o = L_i [\rho + \rho^2 + \rho^3 ...  + \rho^N ...]\\\\
 L_o = L_i \sum_{i=1}^\infty{\rho^i} \\\\
 L_o = L_i \left(\frac{\rho}{1-\rho}\right)
$$

This equation is, of course, entirely incorrect because it doesn't ensure energy conservation if $\rho > \frac{1}{2}$, as can be seen in this plot.

![plot](images/ShadowColor/InfiniteBounces.jpg)


Nonetheless, it helps us grasp the nature of the phenomenon.


## Conditions

Obviously, in order to be able to view many reflections and the effect of saturation, the light source needs to be very strong to be in contrast to the otherwise ambient light when the surface is in full shadow.

Also, it's important to realize this process can only occur on already saturated surfaces, or with a strongly colored indirect light.




The saturation process thus comes from multiple-scattering on the rough surface, it is also increased due to indirect lighting in general and it appears in the shadow region simply because:

* In full shadow, only indirect lighting can be perceived as an almost uniform ambient light
* In full light, strong direct light (often the Sun) completely burns the subtle saturation effect

In the penumbra, on the other hand, we have all the possible transition states between full burnt out predominant direct light, down to the full washed out ambient indirect light and within that small transition zone, we


Figure 2.4. Glossy sphere under a single direct light source, showing terminology of light and shade. Photograph by David Briggs. [Source](http://www.huevaluechroma.com/022.php)
![Groplan](images/ShadowColor/Ball.jpg)


## Tutorials

![Groplan](images/ShadowColor/SaturationExample.jpg)

From [https://androidarts.com/art_tut.htm#shadows](https://androidarts.com/art_tut.htm#shadows)

Classic Arts:

[http://www.art.net/~rebecca/ShadeDefinitions.html](http://www.art.net/~rebecca/ShadeDefinitions.html)

Pinterest with many interesting slides:

[https://www.pinterest.com/roqueromero/resources-lights-and-shadows-tuts/](https://www.pinterest.com/roqueromero/resources-lights-and-shadows-tuts/)
