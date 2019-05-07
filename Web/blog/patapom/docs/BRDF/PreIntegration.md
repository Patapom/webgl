
Since the paper "Real Shading in Unreal Engine 4" [^1] by Brian Karis, most people have been using pre-integrated illuminance encoded in the mips of cube maps to represent the specular illuminance to feed their BRDF.

You often read something like "a different mip corresponds to some roughness value" but it's generally not very clear how exactly do you tie the mip level and the roughness value of the BRDF?

There are various possible schemes, some of them are explored by S. Lagarde in "Moving Frostbite to PBR" [^2] in section 4.9.2 eq. 63 where they chose the simple expression:

$$
m = \alpha \cdot N
$$

Where $\alpha$ is the specular roughness (note that Lagarde uses the "linear roughness" or "perceptual roughness" $\alpha_{lin} = \alpha^2$ so $\sqrt{\alpha_{lin}} = \alpha$), $m$ is the mip level and $N$ is the maximum mip level (e.g for a 256x256 cube map, N would be $log_2(256)=8$).

This mapping has the enormous advantage of being very simple, but it is not the optimal one.


## Stating the problem

Basically, for each mip level, we want a pixel to cover the "most significant footprint of BRDF".

In other words, we want the integral of the BRDF to be maximal when summed over the solid angle covered by the pixel.


As explained by McGuire [^3], we know the average solid angle covered by a pixel of the cube map at a given mip level is given by:

$$
d\Omega_p(m) = \frac{4\pi}{6} 2^{2(m-N)}
$$

We can see that at mip $N$, when there only remains a single pixel, we cover a full face of the cube, that is $d\Omega_p = \frac{2\pi}{3}$.


## Equivalent solid angle by a cone

The cone covering the same solid angle as a texel from the cube map is determined by the cosine of its half aperture angle:

$$
d\Omega_c(\mu) = 2\pi (1 - \mu)
$$

Where $\mu = \cos(\theta)$ and $\theta$ is the cone's half aperture angle.


Posing $d\Omega_p = d\Omega_c$ we get:

$$
\mu = 1 - \frac{1}{3} 2^{2(m-N)}
$$

which gives us the cosine of the half aperture angle of the cone covering the same solid angle as a single texel of the cube map at mip $m$.


We immediately see that at the maximum mip level $m = N$ we get the maximum aperture angle and:

$\mu_{max} = 1 - \frac{1}{3} = \frac{2}{3}$

(this will be important later)

**NOTE**: It's very interesting to notice that this value is independent of the resolution of the cube map and only depends on the solid angle of a single face of the cube.


## Maximizing the BRDF's footprint

Note that we're dealing with the Cook-Torrance microfacet specular BRDF model here:

$$
\rho( \boldsymbol{ \omega_o }, \boldsymbol{ \omega_i } ) = \frac{ F( \boldsymbol{ \omega_o } \cdot \boldsymbol{h}, F_0 ) G( \boldsymbol{ \omega_i } \cdot \boldsymbol{n}, \boldsymbol{ \omega_o } \cdot \boldsymbol{n}, \alpha ) D( \boldsymbol{ \omega_h } \cdot \boldsymbol{n}, \alpha )}
{4 (\boldsymbol{ \omega_i } \cdot \boldsymbol{n}) (\boldsymbol{ \omega_o } \cdot \cdot \boldsymbol{n})}
$$

Where:

* $\boldsymbol{ n }$ is the unit surface normal vector
* $\boldsymbol{ \omega_i }$ is the unit incoming light vector
* $\boldsymbol{ \omega_o }$ is the unit outgoing view vector
* $\boldsymbol{ \omega_h }$ is the unit half vector
* $\alpha$ is the surface's roughness
* $F_0$ is the surface's specular reflectance at normal incidence


Ignoring the Fresnel coefficient $F$ that is factored out of the pre-integration anyway, and the shadowing/masking terms that are either view-dependent (not in the integral) or light-dependent (not relevant to the problem at hand),
we can focus on the normal distribution function $D( \cos(\theta), \alpha )$ for which we know that, by definition:

$$
2\pi \int_{0}^{\frac{\pi}{2}} D( \cos(\theta), \alpha ) \cos(\theta) \sin(\theta) d\theta = 1
$$

Or in terms of $\mu = \cos(\theta)$:

$$
2\pi \int_{1}^{0} D( \mu, \alpha ) \mu \sqrt{1 - \mu^2} d\mu = 1
$$

More generally, we get the cumulative distribution function:

$$
cdf(\mu, \alpha) = 2\pi \int_{1}^{\mu} D( \mu_i, \alpha ) \mu_i \sqrt{1 - \mu_i^2} d\mu_i
$$


## The case of GGX

In the case of the well-known GGX model, the NDF is:

$$
D( \mu, \alpha ) = \frac{\alpha^2}{\pi ( \mu^2(\alpha^2 - 1) + 1 )^2}
$$

The indefinite integral of $D$ is given by:

$$
C( \mu, \alpha) = 2\pi \int \frac{\alpha^2}{\pi ( \mu^2(\alpha^2 - 1) + 1 )^2} \mu \sqrt{1 - \mu^2} d\mu \\\\
C( \mu, \alpha) = \frac{\alpha^2}{(\alpha^2 - 1) \left( 1 + \mu^2 (\alpha^2 - 1) \right) }
$$

The CDF is then given by:

$$
cdf(\mu, \alpha) = C( 1, \alpha ) - C( \mu, \alpha ) \\\\
cdf(\mu, \alpha) = \frac{ 1 - \mu^2 }{ 1 + \mu^2 (\alpha^2 - 1) }
$$


### Maximizing the CDF

So for any given mip we have the solid angle $d\Omega_p(m)$ covered by a pixel and incidently, the cosine of the equivalent cone $\mu = 1 - \frac{1}{3} 2^{2(m-N)}$.

We're looking after the roughness that best maximizes the expression of the cdf for the given pixel footprint/solid angle.

!!! quote ""
    ![CDF](./images/GGX_CDF_f_roughness.gif)

	CDF as a function of cone angle, for various roughness $\alpha$.


Obviously, a roughness of 0 *always* satisfies our criterium since the CDF is always 1, for any solid angle.

Instead, we need to cover a certain ratio of the CDF $cdf( \mu, \alpha ) = C$ where $C$ is a constant in the range $[0,1]$.


The ideal solution would be that the CDF covers the largest solid angle $\frac{2\pi}{3}$ for the largest roughness value $\alpha_{max} = 1$ at the largest mip $N$ so we simply need to solve:

$$
C = cdf( \mu_{max}, 1 ) = 1 - \mu_{max}^2 = 1 - \frac{1}{3}^2 = \frac{5}{9}
$$

(remember that earlier we found that at the largest mip, the cone would have an aperture half angle corresponding to $\mu_{max} = \frac{2}{3}$) (I told you it would become significant later!)

This results means that, for every mip level, we're looking for the CDF to cover ~55% of its [0,1] range, as shown in this animation below:



!!! quote ""
    ![CDF](./images/GGX_CDF_f_roughness_limit.gif)

	CDF as a function of cone angle, for various roughness $\alpha$. The orange part is the ratio of CDF we need to cover to maximize the footprint of the CDF for a given mip level.



Now that we know that:

$$
C = \frac{ 1 - \mu_{max}^2 }{ 1 + \mu_{max}^2 (\alpha^2 - 1) }
$$

We can finally find our mapping between mip and roughness.



## Mapping mip level to roughness

We know from earlier that:

$$
\mu = 1 - \frac{1}{3} 2^{2(m-N)}
$$

And since it's easy to solve the previous equation for $\alpha$:

$$
\alpha^2 = \frac{(C-1) (\mu^2-1)}{C\mu^2}
$$

We now have the procedure to map mip level to roughness.


## Mapping roughness to mip level

Incidently, $\mu$ as a function of $\alpha$ is given by:

$$
\mu^2 = \frac{1-C}{1 + C(\alpha^2 -1)}
$$

The resulting mip level is obtained by:

$$
m = N + \frac{1}{2} \log_2\left( 3 - 3 \sqrt{ \frac{1 - C}{ 1 + C(\alpha^2 - 1) } } \right)
$$


## Result

<!--
This is a live demo of what's happening when we increase the roughness:

![MSBRDFSaturation](./images/MSBRDFSaturation.gif)
-->

## Conclusion


Mapping is very ugly! :D



## References

[^1]: Karis, B. 2013 ["Real Shading in Unreal Engine 4"](https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_slides.pdf)
[^2]: Lagarde, S. de Rousiers, C. 2014 ["Moving Frostbite to PBR"](https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf)
[^3]: McGuire, M. 2011 ["Plausible Environment Lighting in Two Lines of Code"](http://casual-effects.blogspot.com/2011/08/plausible-environment-lighting-in-two.html)
