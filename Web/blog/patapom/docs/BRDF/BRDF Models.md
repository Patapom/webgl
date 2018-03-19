## Change of Variable

Before we delve into the mysteries of materials modeling, you should get yourself familiar with a very common change in variables introduced by Szymon Rusinkiewicz [^1] in 1998.

The idea is to center the hemisphere of directions about the half vector $h=\frac{\omega_i+\omega_o}{\left \Vert \omega_i+\omega_o \right \|}$ as shown in the figure below:

![File:BRDFChangeOfVariable.jpg|600px](../images/BRDF/BRDFChangeOfVariable.jpg)

This may seem daunting at first but it's quite easy to visualize with time: just imagine you're only dealing with the half vector and the incoming light vector:

* The orientation of the half vector $h$ is given by 2 angles $\langle \phi_h,\theta_h \rangle$. These 2 angles tell us how to rotate the original hemisphere aligned on the surface's normal $n$ so that now the normal coincides with the half vector: they define $h$ as the new north pole.
* Finally, the direction of the incoming vector $\omega_i$ is given by 2 more angles $\langle \phi_d,\theta_d \rangle$ defined on the new hemisphere aligned on $h$.

Here's an attempt at a figure showing the change of variables:

![File:VariableChange.jpg](../images/BRDF/VariableChange.jpg)

We see that the inconvenience of this change is that, as soon as we get away from the normal direction, a part of the new hemisphere stands below the material's surface (represented by the yellow perimeter). It's especially true for grazing angles when $h$ is at 90° off of the $n$ axis: half of the hemisphere stands below the surface!

The main advantage though, is when the materials are isotropic then $\phi_h$ has no significance for the BRDF (all viewing azimuths yield the same value) so we need only account for 3 dimensions instead of 4, thus significantly reducing the amount of data to store!


## BRDF from Actual Materials

!!! note
    ![File:MERL100.jpg|thumb|right|400px|](../images/BRDF/MERL100.jpg)
    The "MERL 100": 100 materials whose BRDFs have been measured and stored for academic research. 50 of these materials are considered "smooth" (e.g. metals and plastics) while the remaining 50 are considered "rough" (e.g. fabrics).


Before writing about analytical and artificial models, let's review the existing physical measurements of BRDF.

There are few existing databases of material BRDFs, we can think of the [MIT CSAIL database](http://people.csail.mit.edu/addy/research/brdf/) containing a few anisotropic BRDF files but mainly, the most interesting database of *isotropic* BRDFs is the [MERL database](http://www.merl.com/brdf/) from Mitsubishi, containing 100 materials with many different characteristics (a.k.a. the "MERL 100").

Source code is provided to read back the BRDF file format. Basically, each BRDF is 33MB and represents 90x90x180 RGB values stored as double precision floating point values (90*90*180*3*sizeof(double) = 34992000 = 33MB).

The 90x90x180 values represent the 3 dimensions of the BRDF table, each dimension being $\theta_h \in [0,\frac{\pi}{2}]$ the half-angle off from the normal to the surface, $\theta_d \in [0,\frac{\pi}{2}]$ and $\phi_d \in [0,\pi]$ the difference angles used to locate the incoming direction.
As discussed earlier, since we're considering *isotropic* materials, there is no need to store values in 4 dimensions and the $\phi_h$ can be safely ignored, thus saving a lot of room!


I wanted to speak of actual materials and especially of the [Disney BRDF Viewer](http://www.disneyanimation.com/technology/brdf.html) first because they introduce a very interesting way of viewing the data present in the MERL BRDF tables.
Indeed, one way of viewing a 3D MERL table is to consider a stack of 180 slices (along $\phi_d$), each slice being 90x90 (along $\theta_d$ and $\theta_h$).

This is what the slices look like when we make $\phi_d$ change from 0 to 90°:

![File:ImageSlicePhiD.jpg](../images/BRDF/ImageSlicePhiD.jpg)


We can immediately notice the most interesting slice is the one at $\phi_d = \frac{\pi}{2}$. We also can assume the other slices are just a warping of this unique, characteristic slice but we'll come back to that later.

Another thing we notice with slices with $\phi_d \ne \frac{\pi}{2}$ are the black texels. Remember the change of variables we discussed earlier? I told you the problem with this change is that part of the tilted hemisphere lies *below* the surface of the material. Well, these black texels represent directions that are below the surface. We see it gets worse for $\phi_d = 0$ where almost half of the table contains invalid directions. And indeed, the MERL database's BRDF contain *a lot* (!!) of invalid data. In fact, 40% of the table is useless, which is a shame for files that each weigh 33MB. Some effort could have been made from the Mitsubishi team to create a compressed format that discards useless angles, saving us a lot of space and bandwidth... Anyway, we're very grateful these guys made their database public in the first place! :smile:


So, from now on we're going to ignore the other slices and only concentrate on the *characteristic slice* at $\phi_d = \frac{\pi}{2}$.

Here is what the "MERL 100" look like when viewing only their characteristic slices:

![File:MERL100Slices.jpg](../images/BRDF/MERL100Slices.jpg)


Now let's have a closer look at one of these slices:

![File:MaterialSliceCharacteristics.jpg|800px](../images/BRDF/MaterialSliceCharacteristics.jpg)

We're going to use these *characteristic slices* and their important areas a lot in the following section that will treat of analytical models.


## Analytical models of BRDF

There are many (!!) available models:

* [Phong](http://www.cs.northwestern.edu/~ago820/cs395/Papers/Phong_1975.pdf) (1975)
* [Blinn-Phong](http://research.microsoft.com/apps/pubs/default.aspx?id=73852) (1977)
* [Cook-Torrance](http://www.ann.jussieu.fr/~frey/papers/scivi/Cook%20R.L.,%20A%20reflectance%20model%20for%20computer%20graphics.pdf) (1981)
* [Ward](http://radsite.lbl.gov/radiance/papers/sg92/paper.html) (1992)
* [Oren-Nayar](http://www1.cs.columbia.edu/CAVE/publications/pdfs/Oren_SIGGRAPH94.pdf) (1994)
* [Schlick](http://www.cs.virginia.edu/~jdl/bib/appearance/analytic%20models/schlick94b.pdf) (1994)
* [Modified-Phong](http://www.cs.princeton.edu/courses/archive/fall03/cs526/papers/lafortune94.pdf) (Lafortune 1994)
* [Lafortune](http://www.graphics.cornell.edu/pubs/1997/LFTG97.pdf) (1997)
* [Neumann-Neumann](http://sirkan.iit.bme.hu/~szirmay/brdf6.pdf) (1999)
* [Albedo pump-up](http://sirkan.iit.bme.hu/~szirmay/pump3.pdf) (Neumann-Neumann 1999)
* [Ashikhmin-Shirley](http://www.cs.utah.edu/~michael/brdfs/jgtbrdf.pdf) (2000)
* [Kelemen](http://www.hungrycat.hu/microfacet.pdf) (2001)
* [Halfway Vector Disk](http://graphics.stanford.edu/~boulos/papers/brdftog.pdf) (Edwards 2006)
* [GGX](http://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf) (Walter 2007)
* [BRDF](http://www.cs.utah.edu/~premoze/dbrdf Distribution-based) (Ashikmin 2007)
* [Kurt](http://www.siggraph.org/publications/newsletter/volume-44-number-1/an-anisotropic-brdf-model-for-fitting-and-monte-carlo-rendering) (2010)
* etc.


Each one of these models attempts to re-create the various parts of the *characteristic slices* we saw earlier with the MERL database, but none of them successfully covers all the parts of the BRDF correctly.

The general analytical model that is often used by the models listed above is called "microfacet model". It is written like this for isotropic materials:

$$
f_r(x,\omega_o,\omega_i) = \mbox{diffuse} + \mbox{specular} = \mbox{diffuse} + \frac{F(\theta_d)G(\theta_i,\theta_o)D(\theta_h)}{4\cos\theta_i\cos\theta_o}~~~~~~~~~\mbox{(4)}
$$


### Specularity
![File:BRDFPartsSpecular.jpg|thumb|right](../images/BRDF/BRDFPartsSpecular.jpg)

This "simple" model makes the assumption a macroscopic surface is composed of many perfectly specular microscopic facets, a certain amount of them having their normal $m$ aligned with $h$, making them good candidates for specular reflection and adding their contribution to the outgoing radiance. This distribution of normals in the microfacets is given by the $D(\theta_h)$ also called *Normal Distribution Function* or **NDF**.

![File:Microfacets.jpg|800px](../images/BRDF/Microfacets.jpg)

The NDF is here to represent the specularity of the BRDF but also the retro-reflection at glancing angles.
There are many models of NDF, the most well known being the Blinn-Phong model $D_\mathrm{phong}(\theta_r) = \frac{2+n}{2\pi} \cos\theta_h^n$ where n is the specular power of the Phong lobe.

We can also notice the Beckmann distribution $D_\mathrm{beckmann}(\theta_h) = \frac{\exp{\left(-\tan^2(\theta_h)/m^2\right)}}{\pi m^2 \cos^4(\theta_h)}$ where *m* is the Root Mean Square (rms) slope of the surface microfacets (the roughness of the material).

Another interesting model is the Trowbridge-Reitz distribution $D_\mathrm{TR}(\theta_h) = \frac{\alpha_\mathrm{tr}^2}{\pi(\alpha_\mathrm{tr}^2.\cos(\theta_h)^2 + sin(\theta_h)^2)}$

Most models fail to accurately represent specularity due to "short tails" as can be seen in the figure below:

![File:ShortTailedSpecular.jpg](../images/BRDF/ShortTailedSpecular.jpg)


Disney uses an interesting variation of the Trowbridge-Reitz distribution that helps to compensate for the short tail problem:

$$
D_\mathrm{generalizedTR}(\theta_h) = \frac{\alpha_\mathrm{tr}^2}{\pi(\alpha_\mathrm{tr}^2.\cos(\theta_h)^2 + sin(\theta_h)^2)^\gamma}
$$

![File:GeneralizedTrowbridge.jpg|600px](../images/BRDF/GeneralizedTrowbridge.jpg)


You can find more interesting comparisons of the various NDF in the [talk](http://blog.selfshadow.com/publications/s2012-shading-course/hoffman/s2012_pbs_physics_math_notes.pdf) by Naty Hoffman.


### Fresnel
![File:BRDFPartsFresnel.jpg|thumb|right](../images/BRDF/BRDFPartsFresnel.jpg)

The $F(\theta_d)$ term is called the ["Fresnel Reflectance"](http://en.wikipedia.org/wiki/Fresnel_equations) and models the amount of light that will effectively participate to the specular reflection (the rest of the incoming light entering the surface to participate to the diffuse effect).

Notice that $F(\theta_d)$ depends on $\theta_d$ and not $\theta_h$ as we would normally expect, this is because in the micro-facet model consider the micro-facet's normal to be *aligned* with $h$ and so the Fresnel effect occurs when the view/light direction is offset from the facet's direction. This offset is represented here by $\theta_d$.

Also notice in the graph below we use $\theta_i$ because the graph was taken from Naty Hoffman's talk at a point where he wasn't yet considering the micro-facet model but the macroscopic model where $\theta_i$ is the offset from the macroscopic surface normal $n$.

![File:Fresnel.jpg|800px](../images/BRDF/Fresnel.jpg)


We immediately notice that:

* The Fresnel reflectance curves don't change much over most of the range, say from 0° (i.e. light/view is orthogonal to the surface) to ~60°, then the reflectance jumps to 1 (i.e. total reflection) at 90° which is quite intuitive since photons arriving at grazing angles have almost no chance of entering the material and almost all of them bounce off the surface. The Fresnel reflectance value when $\theta_d = 0°$ (i.e. when viewing the surface perpendicularly) is called $F_0$ and is often used as the *characteristic specular reflectance* of the material. It's very convenient as it can be represented by a RGB color in [0,1] and we can think of it as the "specular color" of the material.

* Metals usually have a colored specular reflection while dielectric materials (e.g. water, glass, crystals) have a uniform specular and need only luminance encoding.

* Finally, we can notice (actually, I didn't notice that at all, I read it in one of the lectures :smile:) that smooth materials generally have a Fresnel reflectance $F_0 < 0.5$ while rough materials have a $F_0 > 0.5$.


The expressions for the [Fresnel reflectance](http://en.wikipedia.org/wiki/Fresnel_equations#Definitions_and_power_equations) are quite complicated and deal with complex numbers to account for light polarity, but thanks to a simplification by [Schlick](http://www.cs.virginia.edu/~jdl/bib/appearance/analytic%20models/schlick94b.pdf) (in the same paper where he described his BRDF model!), it can be written:

$$
F(\theta_d) = F_0 + (1 - F_0) (1 - \cos \theta_d)^5~~~~~~~~~\mbox{(5)}
$$


The Fresnel reflection *represents the increase in specular reflection as the light and view vectors move apart and predicts that all smooth surfaces will approach 100% specular reflection at grazing incidence*.
This is purely theoretical though, because in reality many materials are not perfectly smooth and don't reflect light exactly as predicted by the Fresnel function, as we can see in the figure below where the theoretical Fresnel reflection is compared to the reflection of 100 MERL materials at grazing incidence:

![File:](../images/BRDF/FresnelComparison.jpg)


### Diffuse Part
![File:BRDFPartsDiffuse.jpg|thumb|right](../images/BRDF/BRDFPartsDiffuse.jpg)

The diffuse part of the equation is modeled by diffuse models like [Lambert](http://en.wikipedia.org/wiki/Lambert%27s_cosine_law), [Oren-Nayar](http://www1.cs.columbia.edu/CAVE/publications/pdfs/Oren_SIGGRAPH94.pdf) or [Hanrahan-Krueger](http://www.irisa.fr/prive/kadi/Lopez/p165-hanrahan.pdf):

![File:DiffuseModels.jpg|600px](../images/BRDF/DiffuseModels.jpg)


From the micro facet equation (4), we remember the diffuse part is added to the specular part.
To enforce energy conservation, the diffuse part should also be multiplied by a factor giving the amount of energy that remains after having been specularly reflected. The simplest choice would be to use $1 - F(\theta_d)$, but more complex and accurate models exist.

For example, from [^2] we find that:
$$
F_\mbox{diffuse} = (\frac{n_i}{n_t})^2 (1 - F(\theta_d))
$$

where $n_i$ and $n_t$ are the refraction indices of the incoming and transmitted medium respectively. [^2] explain this factor as a change in the size of the solid angle due to penetration in the medium. Notice that, obviously, if you're considering a transparent medium then the Fresnel factor when exiting the material is multiplied by $(n_t/n_i)^2$ so it counterbalances the factor on entry, rendering the factor useless...


Anyway, since the energy on the way in of a diffuse or translucent material gets weighted by the Fresnel term, it's quite reasonable to assume it should be weighted by another kind of "Fresnel term" on the way out. Except this time, the *Fresnel term* actually is some sort of integration of Fresnel reflectance for all the possible directions contributing to the diffuse scattering effect: (TODO)

![File:DiffuseFresnel.jpg|1000px](../images/BRDF/DiffuseFresnel.jpg)

!!! note
    We know that only a limited cone of angle $\theta_c = \sin^{-1}(n_i/n_t)$ will contain the rays that can come out of a diffuse medium, above that angle there will be total internal reflection.
    By assuming an isotropic distribution of returning light, we can compute the percentage that will be transmitted and hence considered reflected. This sets an upper bound on the subsurface reflectance of $1 - (n_i/n_t)^2$. For example, for an air-water boundary, the maximum subsurface reflectance is approximately 0.44


We can notice some areas of interest in a typical diffuse material:

![File:DiffuseVariations.jpg](../images/BRDF/DiffuseVariations.jpg)

![File:DiffuseMainAreas.jpg](../images/BRDF/DiffuseMainAreas.jpg)


![File:ColorChangingFabric.jpg|thumb|right|](../images/BRDF/ColorChangingFabric.jpg "A fabric that changes its color along with the view angle")

* There is this vast, almost uniform, area of colored reflection. This is the actual diffuse color of the material, what we call the diffuse albedo of the surface which is often painted by artists.
* There is a thin vertical band on the right side that represents grazing-reflection. Possibly of another color than the main diffuse part, as is the case with some fabrics.
* At the bottom of this vertical band, when the view and light vectors are colinear, we find the grazing retro-reflection area where light is reflected in the direction of the view.

From the plot of retro-reflective response of the MERL 100, we can see that the surge in retro-reflection essentially comes from the roughness of the material:

![File:RoughnessRetroReflection.jpg|600px](../images/BRDF/RoughnessRetroReflection.jpg)

This is quite normal because roughness is a measure of disorder of the micro-facets on the surface of the material. If roughness is large it means that there is  potentially a large amount of those micro-facets that will be able to reflect light in the direction it originally came from.


A very interesting fact I learned from Naty Hoffman's [talk](http://blog.selfshadow.com/publications/s2012-shading-course/hoffman/s2012_pbs_physics_math_notes.pdf) is that, because of free electrons, metals completely absorb photons if they are not reflected specularly: metals have (almost) no diffuse components. It can be clearly seen in the characteristic slices of several metals:

![File:MetalsNoDiffuse.jpg|800px](../images/BRDF/MetalsNoDiffuse.jpg)


Also, we saw that metals have a colored specular component encoded in the $F_0$ Fresnel component, as opposed to dielectric materials which are colorless. This is visible on the specular peak reflecting off a brass sphere:

![File:BrassColoredSpecular.jpg](../images/BRDF/BrassColoredSpecular.jpg)

### Shadowing / Masking
Finishing with the micro facet model, because the landscape of microfacets is not perfectly flat, some of the micro facets will shadow or mask other facets. This is the geometric factor represented by the $G(\theta_i,\theta_o)$ term.

![File:MicrofacetsShadowingMasking.jpg|800px](../images/BRDF/MicrofacetsShadowingMasking.jpg)

This geometric factor is usually quite hard to get but is essential to the energy-conservation problem otherwise, the micro-facets model can easily output more energy than came in, especially at glancing angles as shown on the figure below:

![File:ImportantShadowing.jpg](../images/BRDF/ImportantShadowing.jpg)

The top figure shows a very slant view direction. The micro-facets contributing to the lighting in the view direction (regardless of shadowing) are highlighted in red.
In the bottom row, the projection of the surface area in the view direction is represented as the green line.
The bottom left figure shows an incorrect accumulation of the total area of micro facets where shadowing is not accounted for, resulting in a total reflection surface larger than the projected surface which will yield more energy than actually incoming to the surface area.
The bottom right shows correct accumulation of the total area that takes shadowing into account, the resulting area is smaller than the projected surface area and cannot reflect more energy than put in. 


The geometry of the micro-facets landscape of a material influence the entire range of reflectance, it's not clear how to actually "isolate it" as a characteristic of the material like the specular and Fresnel peaks, or the diffuse and retro reflections areas clearly visible on the characteristic slices but we can hopefully retrieve it once we successfully retrieve all the other components...

Anyway, it's not compulsory to be exact as long as the expressions for Fresnel/specular peaks and overall reflectances don't yield infinity terms at certain view/light angles and as long as the integral of the BRDF for any possible view direction doesn't exceed 1.

###So what?###
People have been trying to replicate each part of the characteristic BRDF slice for decades now, isolating this particular feature, ignoring that other one.

It seems to be quite a difficult field of research, but what's the difference between film production and real-time graphics? Can we skip some of the inherent complexities and focus on the important features?


####Importance Sampling####
Modern renderers that make a heavy usage of ray-tracing also require from each of the analytical models that they are easily adapted to importance sampling. That means the renderers need to send rays where they matter &ndash;toward the important parts of the BRDF&ndash; and avoid unimportant parts that would otherwise consume lots of resources and time to bring uninteresting details to the final pixel.

Although importance sampling starts entering the realm of real-time rendering [^3], it's not yet a compulsory feature if we're inventing a new BRDF model.

####Accuracy####
We saw the most important part of a BRDF model is that it must be energy-conservative. Video games have been widely using simple models for years without caring much about energy conservation, but more and more games are betting on photo-realism (Crysis, Call of Duty, Battlefield, etc.) and that's no longer an option.

Honestly, it's my experience that as long as there are not factor 10 errors in the results, we usually accept an image as "photorealistic" as soon as it "*looks right*(tm)".


The most important feature of photorealistic real-time renderings is that elements of an image "*look right*(tm)" each one relative to the other. The absolute accuracy is not indispensable nor desirable. And even if you're the next Einstein of computer graphics, your beautiful ultra-accurate model will be broken by some crazy artist one day or another! :smile:


But that's a good thing! That means we have quite a lot of latitude if we wish to invent a new BRDF model that "*looks right*(tm)" and, above all, offers a lot of flexibility and also renders new materials that were difficult to get right before.


####Speed####
If accuracy is not paramount for the real-time graphics industry, speed on the other hand is non-negotiable!

The cost of a BRDF model is not evaluating the model itself &ndash;especially now that exponentials and tangents don't cost you an eye anymore&ndash; it lies in the fact that we really need to evaluate that model times and times again to get an estimate of the integral of equation (2), that we write here again because we have a poor memory:

$$
L_r(x,\omega_o) = \int_\Omega f_r(x,\omega_o,\omega_i) L_i(\omega_i) (n.\omega_i) \, d\omega_i~~~~~~~~~\mbox{(2)}
$$


If our BRDF model can give us an estimate of the roughness (i.e. glossiness) of our reflections, and if we're using a cube map for IBL lighting then we can use clever pre-filtering of the cube-map to store pre-blurred radiance in the mip-maps of the cube map and thus get a fast estimate of the integral.

* That works well for a perfectly diffuse material that will sample the last 1x1 mip (actually returning the irradiance).
* That works equally well for a perfectly specular material that will sample a single direction from the most details mip (level 0) in the reflected view direction.
* That also works quite well for a perfectly glossy material that will sample the appropriate mip level depending on the solid angle covered by the glossy cosine lobe

We see that, all in all, it works well for simple materials that can interpolate the glossiness (i.e. the specular power of the cosine lobe in the Blinn-Phong model) from perfectly diffuse to perfectly specular.

But that breaks down rapidly if your BRDF consists of multiple lobes and other curious shapes thoses BRDF often take...


So we would need to actually shoot several rays to account for complex materials? It seems expensive... But wait, aren't we already doing that when computing the SSAO? Couldn't we use that to our advantage?


##References##

[^1] ["A New Change of Variables for Efficient BRDF Representation"](http://www.cs.princeton.edu/~smr/papers/brdf_change_of_variables/) Szymon Rusinkiewicz (1998)

[^2] ["Reflection from Layered Surfaces due to Subsurface Scattering"](http://www.irisa.fr/prive/kadi/Lopez/p165-hanrahan.pdf) Hanrahan and Krueger (1993)

[^3] ["GPU-Based Importance Sampling"](http://http.developer.nvidia.com/GPUGems3/gpugems3_ch20.html) Colbert et al. GPU Gems 3 (2007)



## Next

In the [next section](BRDF Study), we will discuss about a (failed) attempt at modeling all the slices of the MERL Database from a single characteristic slice.
