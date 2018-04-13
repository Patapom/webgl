# Multiple-Scattering BRDF

In 2014 and 2015, many groundbreaking papers from Heitz et al. [^1] [^2] [^3] [^4] started to shed a new light (haha) on alternative models to the classical micro-facet model and introduced
 a more general volumetric framework called the "microflakes model" that tried to unify surfacic and volumetric materials into a unique solution (and indeed, in the real world, there is no such distinction between a "surface" and a "volume").

With this new micro-flakes model and adequate phase functions, Heitz et al. began to reflect (haha) on the re-introduction of the energy lost with classical BRDF models because of shadowing and masking.

![shadowing/masking](../images/BRDF/MicrofacetsShadowingMasking.jpg)

Indeed, although the shadowing term correctly prevents a micro-surface element to be directly lit by a light source, the masking on the other hand is incorrectly removing lighting that, in the real world, would otherwise be indirectly perceived by reflection.

Suffice it to say that classical BRDF models up until 2014 were *single-scattering* models, while in reality, light bounces of the micro-structures of a surface/volume and is re-injected multiple times, showing a new gain in energy: real-world BRDFs are *multiple-scattering* models.

!!! quote ""
    ![shadowing/masking](../images/BRDF/MSBRDF.jpg)

	(Source: "Multiple-Scattering Microfacet BSDFs with the Smith Model" [^4])



## Simulation

As soon as I had read the papers from Heitz et al. I immediately got to work to try and be one of the first to get a working MSBRDF model for runtime game use.

My idea was simple:

1. Simulate the probabilistic reflection of many rays of light hitting a rough surface (first the diffuse case, then the metal case, then the general dielectric case with refraction)
2. Analyze the shape of the lobe that reflects off from it
3. Fit a simple analytical lobe model with few free parameters
4. Find an analytical fit of these free parameters
5. Use this analytical fit to express the lobes at runtime for many light bounces
6. Add this quantity to the existing BRDF to obtain additional, multiply-scattered bounces

I was planning on having enough time to write 2 methods: one that uses many rays, the other one implementing the statistical model from Heitz et al. [^4] and also to be able to simulate diffuse, metallic and dielectric surfaces.<br/>
In practice, I only had time to write the brute-force ray-casting method for diffuse, metallic and dielectrics, and do the fitting for the diffuse lobes only.

You can find the latest stage of the project from late 2015, early 2016 as I left it in my [God Complex Repository](https://github.com/Patapom/GodComplex/tree/master/Tests/TestMSBSDF).


### Using Brute Force Ray-Casting

So I went on writing a small test application that would be using Compute Shaders to cast many rays &mdash; actually **500 million rays** &mdash; on a tiny patch of rough micro-surface (the size of the patch is not relevant, only the distribution of micro-facet slopes is important).

!!! quote ""
    ![broute](../images/BRDF/SurfaceRayCasting.jpg)

	My little simulator, bombarding 500 million rays on a tiny surface patch and accounting for 4 orders of scattering.


Basically, the algorithm when no refraction is involved goes like this:

1. Create a random ray coming from the user-specified direction (i.e. an incidence angle $\theta$)
2. For each scattering event $S$

	3.1. Shoot the ray across a carefully generated heightfield whose height distribution obeys a Beckmann distribution [^9]

    3.2. If the ray exits the surface, store it in the $S$ order scattering histogram bin and exit

    3.3. Else, reflect the ray across the perfectly specular micro-surface and continue the trace


Here is a view of the resulting histogram bins for the 4th order of scattering over a metallic surface of roughness $\alpha = 0.8$:

![histogram](../images/BRDF/ResultingHistogram.jpg)

Each pixel represents a bin for a directional vector with spherical coordinates $(\theta,\phi)$, the image covers the entire upper hemisphere (or lower hemisphere when we are dealing with refraction).


#### Lobe Model

I went on and implemented several micro-facet lobe models, a model being the [NDF](BRDF%20Models/#specularity) and [masking/shadowing](BRDF%20Models/#shadowing-masking) terms.
The [Fresnel](BRDF%20Models/#fresnel) term is the same one for all the models.

* Beckmann Model, that follows the classical [Beckmann distribution](https://en.wikipedia.org/wiki/Specular_highlight#Beckmann_distribution)

	![BeckmannLobe](../images/BRDF/LobeBeckmann.jpg)

* GGX Model, that follows the [GGX distribution](http://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf) described by Walter et al. [^8]

	![GGXLobe](../images/BRDF/LobeGGX.jpg)

* Modified Phong (isotropic and anisotropic), that follows the classical [Phong distribution](https://en.wikipedia.org/wiki/Phong_reflection_model)

	![PhongLobe](../images/BRDF/LobePhong.jpg)


!!! note
    It is important to understand that these models are purely analytical models of normal distributions and shadowing/masking that were devised to work in the limited framework of the *single-scattering* Cook-Torrance micro-facet model.


#### Customization

The goal of my application was to fit new lobes from simulated, empirical data thus I wasn't shy of adding new alien parameters to these models in order to make the resulting lobes more "bendable" and capable of fitting a larger
 set of shapes that could come out from multiple bounces of light, as can be seen in this image:

!!! quote ""
    ![MultipleBounces](../images/BRDF/ScatteringOrders.jpg)

	Multiple orders of scattering on a diffuse surface with roughness $\alpha = 0.8$.
	Lobes are scaled to roughly the same size each time, otherwise their volume collapses to 0 very rapidly with each new bounce.

	We see that the diffuse lobes can be pretty "squashed". We get even worse kinds of shapes when dealing with dielectric materials.

So in addition to the default parameters of these "classical" models:

* The lobe's deviation angle $\theta$, giving its deviation from the macroscopic normal axis $Z$
* The roughness $\alpha$, in [0,1]

I added:

* A "global scale" factor in [0,$\infty$] that is applied to the entire lobe
* An "anisotropic flattening" factor in [-1,1] that allows to squash the lobes along the tangential X & Y axes
* A "masking importance" factor in [0,1] that allows to ignore the influence of the shadowing/masking term entirely.
    It turns out this parameter is not very significant after all.


#### Lobe Fitting

The ray-casting was quite fast (about 1/2 a second per simulation, for 4 scattering orders), now I needed to fit the lobe models with their 5 free parameters.

I revamped the [BFGS](https://en.wikipedia.org/wiki/Broyden%E2%80%93Fletcher%E2%80%93Goldfarb%E2%80%93Shanno_algorithm) implementation I wrote a few years back (it can be found [here](https://github.com/Patapom/GodComplex/tree/master/Packages/MathSolvers)).

This BFGS minimizer is really easy to use: feed it a distance function and a list of free parameters then let it run for a few iterations.<br/>
So in order to make it work with my simulation, I only needed to compute the square difference of each simulated directional bin with my analytical lobe model and let BFGS find the parameter values for which this difference is minimal.

This is a classical minimization problem that has now gained tremendous momentum due to the blooming field of *Machine Learning*.


Anyway, minimization is the most time-consuming part of the application though, as it sometimes takes a hundred iterations to fit a lobe, and that can take quite a while!

That is why I wrote an automation tool to let it work during the night...


#### Automation

I wrote an automation form that allows to configure a "simulation session":

!!! quote ""
    ![broute](../images/BRDF/SurfaceRayCastingAutomation.jpg)


You need to specify how many sampling directions you need and the parameters of the surface (*i.e.* its roughness, whether it's a metal, a dielectric or a diffuse material, its albedo or $F_0$ fresnel term) and let it run.

![automation](../images/BRDF/Automation.gif)

It's interactive in the sense you can see what it's doing in real-time, you can pause, stop, restart, redo one specific direction you are not satisfied with, etc.

The resulting lobe parameters for each simulation and each scattering order are dumped into a file for manual exploitation later.


#### Analytical Fit of Diffuse Lobes

Next, I had a lot of fun :rolling_eyes: with Mathematica trying to find a suitable analytical expression that corresponds to my experimental lobes.

Here are the conclusions, straight from 2 years ago (january 2016), I'm not sure my results are accurate or useable anymore (I should have written this page when I was developping it, now it's hard to remember where I left it at):

---

##### Analytical Lobe Expression

The intensity of the lobe in a specific direction is given by:

$$
f(\omega_o,\omega_i,\alpha,\sigma,m) = \sigma \left( \left(1-m\right) + m \left( G(\mu_i, \alpha ) G(\mu_o, \alpha ) \right) \right) N( \mu_i, \alpha )
$$

Where:

* $\sigma$ is the global scale factor
* $m$ is the importance for the masking/shadowing term, which will be later set to 0 as we will see
* $G(\mu,\alpha)$ is the [masking/shadowing term for the Phong model](http://graphicrants.blogspot.fr/2013/08/specular-brdf-reference.html) which is actually that of Beckmann
* $\mu_i = \boldsymbol{\omega_i} \cdot \boldsymbol{Z}$ is the cosine of the angle between the incoming direction and the macroscopic surface normal
* $\mu_o = \boldsymbol{\omega_o} \cdot \boldsymbol{Z}$ is the cosine of the angle between the outgoing direction and the macroscopic surface normal
* $\alpha$ is the surface roughness

And the Blinn-Phong normal distribution:

$$
N( \mu_i, \alpha ) = \frac{2+\eta(\alpha)}{2\pi} {\mu_i}^{\eta(\alpha)}
$$

with $\eta(\alpha) = 2^{10(1-\alpha)}-1$ defining the exponent based on the surface's roughness $\alpha$ (notice the -1 in the end that allows use to have a 0 exponent to make constant lobes)


!!! warning
    Don't expect the regular Blinn-Phong model for micro-facet models here: I wrote my own to fit my needs in this whole "fitting business"!


After fitting each parameter one after another, I noticed that:

* Incident light angle $\theta$ has no effect on fitted lobe, assuming we ignore the backscattering that is visible at highly grazing angles and that would be better fitted using maybe a GGX lobe that features a nice backscatter property.
* Final masking importance $m$ is 0 after all
* There is only a dependency on albedo $\rho$ for the scale factor (that was expected) and it is proportional to $\rho^2$ for the 2nd order, and to $\rho^3$ for the 3rd order, which was also expected.<br/>
  **NOTE:** We can safely assume there should be a $\rho^N$ dependency for the N-th scattering order...
  

##### Parameters Fitting
 	
Finally, we obtain the following *generic* analytical model of a rough diffuse surface for **all scattering orders** $S > 1$:

$$ 
f_S\left( \omega _o, \alpha, \rho \right) = \sigma_S \left(\rho\right) \frac{2 + \eta\left(\alpha\right)}{2 \pi } \mu^{\eta\left( \alpha \right)} \\\\
\mu = \boldsymbol{\omega_o} \cdot \boldsymbol{Z}
$$

The exponent $\eta\left(\alpha\right)$ is given as a function of surface roughness by:
 
$$
\eta\left(\alpha\right) = 2.5958 \alpha - 1.32697 \alpha^2
$$
 	
The *generic* scale factor $\sigma$ used for **all scattering orders** is given by:
 
$$
\sigma \left( \mu, \alpha, \rho \right) = a(\alpha) + b\left( \alpha \right) \mu + c\left( \alpha \right) \mu^2 + d\left( \alpha \right) \mu^3
$$

Where:
$$
\begin{align}
	a( \alpha ) &=  0.02881326115 - 0.92153748116 \alpha + 6.63272611438 \alpha^2 - 4.595702230 \alpha^3 \\\\
	b( \alpha ) &= -0.09663259042 + 7.21414360220 \alpha - 19.7868451171 \alpha^2 + 11.04205888 \alpha^3 \\\\
	c( \alpha ) &=  0.10935692546 - 10.7904051575 \alpha + 28.5080366763 \alpha^2 - 15.66525827 \alpha^3 \\\\
	d( \alpha ) &= -0.04376425480 + 5.24919600918 \alpha - 13.5827073397 \alpha^2 + 7.348408854 \alpha^3 \\\\
\end{align}
$$

The flattening factor $\sigma_n$ along the main lobe direction $Z$ is given by:

$$ 
 	\sigma_n( \mu, \alpha ) = a( \alpha ) + b( \alpha ) \mu + c( \alpha ) \mu^2 + d( \alpha ) \mu^3
$$

Where:
$$
\begin{align}
	a(\alpha) &=  0.9136430 - 1.655480 \alpha + 1.39617 \alpha^2 - 0.320331 \alpha^3 \\\\
	b(\alpha) &=  0.0447239 + 0.624740 \alpha \\\\
	c(\alpha) &= -0.1188440 - 0.973213 \alpha + 0.36902 \alpha^2 \\\\
	d(\alpha) &=  0.1325770 + 0.169750 \alpha \\\\
\end{align}
$$
 	
So the world-space intensity of the fitted lobe is finally obtained by multiplying the lobe-space intensity with the scale factor:

$$ 
 f_w\left( \omega_o, \alpha, \rho \right) = L\left( \mu, \sigma_n( \mu, \alpha ) \right) f_2\left( \omega_o, \alpha, \rho \right)
$$

$$ 	
 L\left( \mu, \sigma_n \right) = \frac{1}{ \sqrt{ 1 + \mu^2 \left(\frac{1}{ \sigma_n^2 } - 1 \right) } }
$$
 
<!-- Additionally, the fitted lobe roughness \alpha as a function of surface roughness Subscript[\alpha, s] is given by:
 
 	 \alpha(Subscript[\alpha, s])= 1-0.2687 \alpha+0.153596 \alpha^2

DAFUQ? Where does that go? Is this for all alphas???
-->


##### Scale factor for order 2

And the main takeaway here is the global scale factor for scattering order 2:

$$
\sigma_2\left( \mu, \alpha, \rho \right) = \rho^2 \sigma( \mu, \alpha, \rho ) 
$$


##### Scale factor for order 3

Identically, using the same generic parameters as order 2 and fitting the scale factor for order 3, we get:

$$
\sigma_3\left( \mu, \alpha, \rho \right) = 0.363902052363025 * \left( \rho^3 \sigma( \mu, \alpha, \rho ) \right)
$$


##### General rule

Maybe there is a simple general rule to obtain the factor for any scattering order $S$, it would seem the general rule on $\rho^S$ is quite clear but anyway, any scattering order above 3 is completely negligible so I basically stopped there...


##### Example Code

All this seems really complex but we eventually get the new code which ends up being "quite simple":

``` C++
float3	ComputeDiffuseModel( float3 _wsIncomingDirection, float3 _wsOutgoingDirection, float _roughness, float3 _albedo ) {

	// Reorder components
	_wsIncomingDirection = float3( _wsIncomingDirection.x, -_wsIncomingDirection.z, _wsIncomingDirection.y );
	_wsOutgoingDirection = float3( _wsOutgoingDirection.x, -_wsOutgoingDirection.z, _wsOutgoingDirection.y );


	float	cosTheta = saturate( _wsOutgoingDirection.z );

	// Compute lobe scale, exponent and flattening factor based on incoming direction and roughness
	float	mu = saturate( _wsIncomingDirection.z );
	float	mu2 = mu*mu;
	float	mu3 = mu*mu2;

	float	r = _roughness;
	float	r2 = r*r;
	float	r3 = r*r2;

	float4	abcd = float4(	 0.028813261153483097 - 0.9215374811620882 * r + 6.632726114385572  * r2 - 4.5957022306534    * r3,
							-0.09663259042197028  + 7.214143602200921  * r - 19.786845117100626 * r2 + 11.042058883797509 * r3,
							 0.10935692546815767  - 10.790405157520944 * r + 28.50803667636733  * r2 - 15.665258273262731 * r3,
							-0.04376425480146207  + 5.2491960091879    * r - 13.582707339717146 * r2 + 7.348408854602616  * r3
						);

	float	sigma2 = abcd.x + abcd.y * mu + abcd.z * mu2 + abcd.w * mu3;	// 2nd order scattering
	float	sigma3 = 0.363902052363025 * sigma2;							// 3rd order scattering

	// Compute lobe exponent
	float	eta = 2.588380909161985 * r - 1.3549594389004276 * r2;

	// Compute unscaled lobe intensity
	float	intensity = (eta+2) * pow( cosTheta, eta ) / PI;

	// Compute flattening factor
	abcd = float4(	   0.8850557867448499    - 1.2109761138443194 * r + 0.22569832413951335 * r2 + 0.4498256199595464 * r3,
					   0.0856807009397115    + 0.5659031384072539 * r,
					  -0.07707463071513312   - 1.384614678037336  * r + 0.8565888280926491  * r2,
					   0.010423083821992304  + 0.8525591060832015 * r - 0.6844738691665317  * r2
				);

	float	sigma_n = abcd.x + abcd.y * mu + abcd.z * mu2 + abcd.w * mu3;

	float	L = rsqrt( 1.0 + cosTheta*cosTheta * (1.0 / (sigma_n * sigma_n) - 1.0)  );

	// Add albedo-dependency
	return  L * intensity * _albedo * _albedo * (sigma2 + _albedo * sigma3);
}
```

The new code is used like this:

``` C++
	float3	diffuseTerm = (albedo / PI) * LdotN * shadow * lightColor;

	// Add multiple-scattering term
	float	shadowMS = ContrastShadow( shadow, LdotN );	// If not needed, just return "shadow"
	diffuseTerm += (ComputeDiffuseModel( _light, _view, roughness, albedo ) / PI) * shadowMS * lightColor;

```

The ```ContrastShadow()``` should either return "shadow" in the basic case, or you can use the one I describe in the article about [Color Shadows](../ColoredShadows/#implementation) to give it a little coloring! :smile:


##### Result

You can see below the effect of multiple-scattering on shadows and transition areas when the roughness increases:

![MSBRDFSaturation](../images/BRDF/MSBRDFSaturation.jpg)


This is a live demo of what's happening when we increase the roughness:

![MSBRDFSaturation](../images/BRDF/MSBRDFSaturation.gif)


### Conclusion

Regarding this lobe fitting business, you may understandably question the complexity of the computation of the multiple-scattering term considering the low visual impact it's bringing to the table, and I would completely agree with you! :smile:

Unfortunately, I never had the time to finish this project due to the time constraint of working on the production of *Dishonored 2* but I would have loved to continue experimenting, especially re-using Heitz's results instead of casting millions of rays,
 and fitting better lobe models or even find a much simpler way to add back the energy lost by single-scattering models.

Of course, people didn't stop investigate like I did, especially in large companies like Disney, Dreamworks, Weta or ImageWorks. And what had to happen did happen...


## Energy Compensation

In their 2017 talk [^5] at the now famous [Siggraph's Physically Based Shading in Theory and Practice courses](http://blog.selfshadow.com/publications/s2017-shading-course/),
 Kulla and Conti re-introduced a computation [^6] devised long ago by Kelemen and Szirmay-Kalos in 2001.

### The Original Paper

In section 2.2 of their paper [^6], Kelemen et al. wrote about coupling the matte (*i.e.* diffuse) and specular parts of the BRDF.

They write the complete BRDF as:
$$
f_r(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) = f_{r,spec}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) + f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i})
$$

And claim that, although $f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i})$ is difficult to estimate due to the many scattering events that occur when light is not specularly reflected but rather diffused through the material,
they can safely wager about the fact that $f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i})$ is:

1. Energy-preserving
2. Symmetrical
3. Somehow, the **complement** (that's the operative word here) of the specular $f_{r,spec}(\boldsymbol{\omega_o},\boldsymbol{\omega_i})$ part


!!! note ""
    ![kelemen](../images/BRDF/KelemenResults.jpg)

	I remember being very impressed by the images produced by this paper by the time it was published (yes! I'm old!).<br/>
	I believe even now there is a very strong "ground truth" flavor emanating from these images.


#### Prototyping the diffuse BRDF

They write the prototype for such an (*isotropic*) BRDF as:

$$
f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) = k(\lambda).s.r(\mu_o).r(\mu_i) \tag{1}\label{(1)}
$$

Where:

* $k(\lambda)$ is a wavelength-dependent factor (namely, the surface's reflectance in [0,1] for different wavelengths)
* $s$ is a normalization factor yet to be determined
* $r(\mu)$ is some unknown "appropriate scalar function", yet to be determined too
* $\mu_i$ and $\mu_o$ are the $\boldsymbol{\omega_i}\cdot\boldsymbol{n} = \cos(\theta_i)$ and $\boldsymbol{\omega_o}\cdot\boldsymbol{n} = \cos(\theta_o)$ respectively, $\boldsymbol{n}$ being the surface's normal


#### Solving for unknowns

Kelemen et al. continue by writing the albedo (*i.e.* total reflectance for a particular viewing direction) for such a diffuse material:

$$
\begin{align}
a_{diff}(\mu_o) &= \int_{0}^{2\pi} \int_{0}^{\frac{\pi}{2}} f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) \mu_i \sin(\theta_i) d\theta_i d\phi_i	\\\\
a_{diff}(\mu_o) &= \int_{0}^{2\pi} \int_{0}^{\frac{\pi}{2}} k(\lambda).s.r(\mu_o) r(\mu_i) \mu_i \sin(\theta_i) d\theta_i d\phi_i	\\\\
a_{diff}(\mu_o) &= k(\lambda).s.r(\mu_o). 2\pi . \int_{0}^{\frac{\pi}{2}} r(\mu_i) \mu_i \sin(\theta_i) d\theta_i \tag{2}\label{(2)}
\end{align}
$$

!!! note
    Nowadays, we call this total reflectance integral the *"white furnace test"* as it simply integrates the BRDF against a unit radiance over the entire hemisphere.<br/>
    The albedo can thus simply be viewed as a measure of *irradiance* against a totally white ambient background and we will now write:
    
    $$
    a_{diff}(\mu_o) = E_{diff}(\mu_o)
    $$
    
    ($E$ being the symbol usually used for the irradiance)


Since $E_{diff}(\mu_o) + E_{spec}(\mu_o) \le 1$, we can conclude that necessarily:
$$
E_{diff}(\mu_o) \le 1-E_{spec}(\mu_o)
$$

Moreover, in the perfectly reflecting case where the total albedo $E_{diff}(\mu_o) + E_{spec}(\mu_o) = 1$ and $k(\lambda)=1$ then strictly:
$$
E_{diff}(\mu_o) = 1-E_{spec}(\mu_o) \tag{3}\label{(3)}
$$

Equation $\eqref{(2)}$ shows that the diffuse albedo is proportional to $r(\mu_o)$ and, symmetrically, $r(\mu_o)$ is thus proportional to $E_{diff}(\mu_o) = 1-E_{spec}(\mu_o)$.

The important takeway remark here is that:

$$
\begin{align}
	r(\mu_o) &\propto 1-E_{spec}(\mu_o) \\\\
	r(\mu_i) &\propto 1-E_{spec}(\mu_i) \\\\
\end{align}
$$

For the perfectly reflecting case, we can thus rewrite equation $\eqref{(1)}$ as:
$$
f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) = s.(1-E_{spec}(\mu_o)).(1-E_{spec}(\mu_i))
$$

Substituting $\eqref{(3)}$ and this new BRDF into $\eqref{(2)}$ we get:

$$
\begin{align}
\left[1-E_{spec}(\mu_o)\right] &= s.\left[1-E_{spec}(\mu_o)\right]. 2\pi . \int_{0}^{\frac{\pi}{2}} \left[1-E_{spec}(\mu_i)\right] \mu_i \sin(\theta_i) d\theta_i \\\\
s &= \frac{1}{2\pi \left[ \int_{0}^{\frac{\pi}{2}} \left[1-E_{spec}(\mu_i)\right] \mu_i \sin(\theta_i) d\theta_i \right]} \\\\
s &= \frac{1}{\pi - E_{spec}^{avg} } \\\\
\end{align}
$$

Where the specular albedo averaged over all possible view directions on the hemisphere is represented by:

$$
E_{spec}^{avg} = \int_{\Omega^+} E_{spec}(\mu_i) \mu_i d\omega_i = 2\pi \int_0^1 E_{spec}(\mu_i) \mu_i d\mu_i \tag{4}\label{(4)}
$$

!!! warning
	Notice that in the Kelemen and Kulla notations for $f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i})$, they factorized the $\pi$ out of the denominator
	so they write it as $\pi \left( 1 - E_{spec}^{avg} \right)$ and they have $E_{spec}^{avg} = 2 \int_0^1 E_{spec}(\mu_i) \mu_i d\mu_i$ instead but I find that highly
	disturbing so I didn't follow their example (I like to imagine the $E_{spec}^{avg}$ integral converging to a maximum of $\pi$ instead of obfuscating that fact for
	the sake of a "nicer way of writing the result").
<br/>


Finally we write:
$$
f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) = \frac{(1-E_{spec}(\mu_o)).(1-E_{spec}(\mu_i))}{\pi - E_{spec}^{avg}} \tag{5}\label{(5)}
$$


#### Proof of concept

Armed with this new expression for the diffuse BRDF, what happens if we integrate against a unit radiance over the entire hemisphere (*i.e.* the white furnace test again)?

$$
\begin{align}
E_{diff}(\mu_o) &= \int_0^{2\pi} \int_0^{\frac{\pi}{2}}  f_{r,diff}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) \cos(\theta_i) \sin(\theta_i) d\theta_i d\phi	\\\\
E_{diff}(\mu_o) &= \int_0^{2\pi} \int_0^{\frac{\pi}{2}}  \frac{(1-E_{spec}(\mu_o)).(1-E_{spec}(\mu_i))}{\pi - E_{spec}^{avg}} \cos(\theta_i) \sin(\theta_i) d\theta_i d\phi	\\\\
E_{diff}(\mu_o) &= \frac{1-E_{spec}(\mu_o)}{\pi - E_{spec}^{avg}} . \left[ 2\pi. \int_0^{\frac{\pi}{2}} (1-E_{spec}(\mu_i)) \cos(\theta_i) \sin(\theta_i) d\theta_i \right]	\\\\
E_{diff}(\mu_o) &= \frac{1-E_{spec}(\mu_o)}{\pi - E_{spec}^{avg}} . \left[ \pi - E_{spec}^{avg} \right]	\\\\
E_{diff}(\mu_o) &= 1-E_{spec}(\mu_o)	\\\\
\end{align}
$$

We see that $E_{diff}(\mu_o)$ ends up being **the exact complement** of $E_{spec}(\mu_o)$!

So Kelemen et al. already had the key in 2001 but they apparently failed to notice the importance of their result (or did they? :smile:).


### The Revised Usage

After all, isn't that result what we're looking for when looking to compute the multiple-scattering term? Missing energy due to a single-scattering BRDF term that is often too simple?

This is indeed exactly what Kulla et al. very cleverly noticed in their new way of viewing of the problem!

Let $E_{diff}(\mu_o)$ get rewritten as $E_{ms}(\mu_o)$ instead and we get:
$$
E_{ms}(\mu_o) = 1 - E(\mu_o)
$$

With $E_{ms}(\mu_o)$ the irradiance from the multiply-scattered BRDF and $E(\mu_o)$ the irradiance from our classical single-scattered BRDF.

And there you have it:

$$
\begin{align}
E_{ms}(\mu_o) &= 1 - E(\mu_o) \\\\
E_{ms}(\mu_o) &= 1 - \left[ \int_0^{2\pi} \int_0^{\frac{\pi}{2}}  f_r(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) \cos(\theta_i) \sin(\theta_i) d\theta_i d\phi \right]	\\\\
E_{ms}(\mu_o) &= \int_0^{2\pi} \int_0^{\frac{\pi}{2}}  f_{r,ms}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) \cos(\theta_i) \sin(\theta_i) d\theta_i d\phi	\\\\
\end{align}
$$

And we have our new expression for the (ideally reflecting) multiple-scattering BRDF:
$$
f_{r,ms}(\boldsymbol{\omega_o},\boldsymbol{\omega_i}) = \frac{(1-E(\mu_o)).(1-E(\mu_i))}{\pi - E_{avg}} \tag{6}\label{(6)}
$$


### Applications to existing BRDF models

We start by pre-computing the "complement albedo table" for all possible viewing angle $\theta_o$ and all roughness values $\alpha$ for the specular BRDF:

$$
1 - E(\mu_o,\alpha) = 1 - \int_{\Omega^+} f_r(\boldsymbol{\omega_o}, \boldsymbol{\omega_i}, \alpha).(\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i
$$

#### GGX Specular Model

We use the (now) very common GGX normal distribution and Smith GGX shadowing/masking term:

$$
\begin{align}
f_r(\boldsymbol{\omega_o}, \boldsymbol{\omega_i}, \alpha) &= F( \boldsymbol{\omega_o} \cdot \boldsymbol{\omega_h}, F_0 ) \\\\
 &* \left[\frac{1}{\boldsymbol{\omega_i} \cdot \boldsymbol{n} + \sqrt{ \alpha^2 + (1-\alpha^2) (\boldsymbol{\omega_i} \cdot \boldsymbol{n})^2} }\right] \\\\
 &* \left[\frac{1}{\boldsymbol{\omega_o} \cdot \boldsymbol{n} + \sqrt{ \alpha^2 + (1-\alpha^2) (\boldsymbol{\omega_o} \cdot \boldsymbol{n})^2} }\right] \\\\
 &* \left[\frac{\alpha^2}{ \pi \left( (\boldsymbol{\omega_h} \cdot \boldsymbol{n})^2 . (\alpha^2 - 1) + 1 \right)^2 }\right] \\\\
\end{align}
$$

With $F_0 = 1 \Rightarrow F( \boldsymbol{\omega_o} \cdot \boldsymbol{\omega_h}, F_0 ) = 1$ at the moment (*i.e.* perfectly reflective case).<br/>
$\boldsymbol{\omega_h}$ is the normalized half-vector.

Rewritten in terms of $\mu$ we have:

$$
\begin{align}
f_r( \mu_o, \mu_i, \alpha) &= F( \boldsymbol{\omega_v} \cdot \boldsymbol{\omega_h}, F_0 ) \\\\
 &* \left[ \frac{1}{ \mu_i + \sqrt{ \alpha^2 + (1-\alpha^2) \cdot \mu_i^2 } }\right] \\\\
 &* \left[ \frac{1}{ \mu_o + \sqrt{ \alpha^2 + (1-\alpha^2) \cdot \mu_o^2 } }\right] \\\\
 &* \left[ \frac{\alpha^2}{ \pi \left( \mu_h^2 . (\alpha^2 - 1) + 1 \right)^2 }\right] \\\\
\end{align}
$$

With $\mu_h(\mu_o, \mu_i, \phi) = \boldsymbol{\omega_h} \cdot \boldsymbol{n} = \frac{ \mu_o + \mu_i } { \sqrt{ 2 \left( 1 + \mu_o \mu_i + (1-\mu_o^2)(1-\mu_i^2) \cos(\phi) \right) } }$ and $\phi$ is the azimutal angle between $\boldsymbol{\omega_o}$ and $\boldsymbol{\omega_i}$.

You can see the resulting table below:

![AlbedoComplement](../images/BRDF/AlbedoComplement.jpg)

!!! warning
    Obviously, don't use this awful JPG image directly! :smile:
	Use [this 128x128 table](MSBRDF_E128x128.csv) instead! (I provide a 128x128 version although, as noted by Kulla et al., the function is very smooth and a 32x32 texture is more than enough).

	The 1st float is $\mu = \cos(\theta)$ of the incident or outgoing ray direction, the 2nd float is the roughness $alpha$ and the 3rd float is $E\left( \mu, \alpha \right)$ (caution, not $1-E$!)


##### Average Irradiance

Armed with this table, we can obtain the average irradiance table that only depends on roughness by computing $\eqref{(4)}$:

$$
E_{avg}\left( \alpha \right) = 2\pi \int_0^1 E(\mu_i,\alpha)\mu_i d\mu_i
$$

![Eavg](../images/BRDF/Eavg.png)


!!! info
    You can download [this table](MSBRDF_Eavg128.csv) representing the $E_{avg}$ for different values of roughness.

	The 1st float is the roughness $\alpha$ and the 2nd float is $E_{avg}\left( \alpha \right)$


##### Energy Conservation Check

We quickly check the energy is conserved by ensuring that for all roughness values of $\alpha \in [0,1]$ we have:

$$
\int_{\Omega_+} \left[ \int_{\Omega_+} \left( f_{r,ggx}\left( \boldsymbol{\omega_o}, \boldsymbol{\omega_i}, \alpha \right) + f_{r,ms}\left( \boldsymbol{\omega_o}, \boldsymbol{\omega_i}, \alpha \right) \right)
(\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i \right]
(\boldsymbol{\omega_o} \cdot \boldsymbol{n}) d\omega_o = \pi
$$

!!! quote ""
	![CheckConvservation](../images/BRDF/MSBRDFCheck.png)

	Gray curve is the GGX specular BRDF, blue curve is the "energy compensation BRDF", red curve is their sum that always yield $\pi$, thus ensuring the conservation of energy.

<br/>
We also quickly notice that the multiple scattering BRDF term becomes preponderant over the single scattering term when $\alpha > 0.8$, so for very rough materials where shadowing and masking are playing a major
 role in energy loss.


##### The case of perfectly reflective rough metal

Remembering that we fixed the Fresnel term to be $F( \boldsymbol{\omega_h}, F_0 ) = 1$, the tables we just calculated can only give us the perfectly reflective 100% white metal BRDF case:


!!! todo
	**TODO**


#### Oren-Nayar Diffuse Model

We now concentrate on another BRDF, the Oren-Nayar diffuse model.

First introduced in 1992 by Michael Oren and Shree Nayar in the context of machine vision[^10], then published again[^11] in 1994 for CGI this time, this model is similar to the Cook-Torrance micro-facet model
 used for specular reflection as it uses v-cavities to represent the roughness of a surface but this time for the diffuse case (*i.e.* the micro-facets are purely lambertian, not pure mirrors like with the Cook-Torrance model),
 the Lambertian reflectance being only a special configuration of this more general model.

Oren and Nayar also provide an additional inter-reflection term, as a complement to the single scattering BRDF but it is finally not included in their formulation. <br/>
It's this additional term that I propose to provide here using the multiple-scattering integral instead.


In section 4.4 of their paper, we find the expression for the BRDF of a generalized rough diffuse surface that is written as:

$$
\begin{align}
f_r( \theta_o, \phi_o, \theta_i, \phi_i, \sigma) &= \frac{\rho}{\pi} \cos( \theta_i ) \left[ A + B \cdot max( 0, \cos( \phi_o - \phi_i ) ) \\\\
 \cdot \sin\left( max( \theta_o, \theta_i ) \right) \tan\left( min( \theta_o, \theta_i ) \right) \right] \\\\
 A &= 1 - \frac{\sigma^2}{2\left( \sigma^2 + 0.33 \right)} \\\\
 B &= 0.45 \frac{\sigma^2}{ \sigma^2 + 0.09} \\\\
\end{align}
$$

$\sigma \in [0,\frac{\pi}{2}]$ is the standard angle deviation for the micro-facets' slope distribution and represents the roughness of the surface. Note that $\sigma = 0$ falls back to the standard Lambertian reflection.

You can find below a simple HLSL implementation for the Oren-Nayar diffuse model:

???- "Oren-Nayar Implementation (HLSL)"
	``` C++

		// Simple OrenNayar implementation
		//	_normal, unit surface normal
		//	_light, unit vector pointing toward the light
		//	_view, unit vector pointing toward the view
		//	_roughness, Oren-Nayar roughness parameter in [0,PI/2]
		//
		float	ComputeOrenNayar( in float3 _normal, in float3 _light, in float3 _view, in float _roughness ) {
			float3	n = _normal;
			float3	l = _light;
			float3	v = _view;

			float	LdotN = dot( l, n );
			float	VdotN = dot( v, n );

			// I realize that this doesn't give cosine phi, we need to divide by sqrt( 1-VdotN*VdotN ) * sqrt( 1-LdotN*LdotN )
			//	but I couldn't distinguish any difference from the actual formula so I just left that as it is...
			float	gamma = dot(
								v - n * VdotN,
								l - n * LdotN 
							);
				
			float rough_sq = _roughness * _roughness;
			float A = 1.0 - 0.5 * (rough_sq / (rough_sq + 0.33));	// You can replace 0.33 by 0.57 to simulate the missing inter-reflection term, as specified in footnote of page 22 of the 1992 paper
			float B = 0.45 * (rough_sq / (rough_sq + 0.09));

			// Original formulation
			//	float angle_vn = acos( VdotN );
			//	float angle_ln = acos( LdotN );
			//	float alpha = max( angle_vn, angle_ln );
			//	float beta  = min( angle_vn, angle_ln );
			//	float C = sin(alpha) * tan(beta);

			// Optimized formulation (without tangents, arccos or sines)
			float2	cos_alpha_beta = VdotN < LdotN ? float2( VdotN, LdotN ) : float2( LdotN, VdotN );	// Here we reverse the min/max since cos() is a monotonically decreasing function
			float2	sin_alpha_beta = sqrt( saturate( 1.0 - cos_alpha_beta*cos_alpha_beta ) );			// Saturate to avoid NaN if ever cos_alpha > 1 (it happens with floating-point precision)
			float	C = sin_alpha_beta.x * sin_alpha_beta.y / (1e-6 + cos_alpha_beta.y);

			return saturate( LdotN ) * (A + B * max( 0.0, gamma ) * C);
		}

	```

##### Irradiance Table

Once again, we compute the irradiance table $E(\mu_o,\alpha)$ using the Oren-Nayar BRDF model, with $\sigma = \frac{\pi}{2} * \alpha$ and we obtain the following table:

![AlbedoComplement](../images/BRDF/AlbedoComplementOrenNayar.png)


!!! info
	You can use [this 128x128 table](MSBRDF_OrenNayar_E128x128.csv) with the same formatting as the GGX tables.


##### Average Irradiance

And again, we can obtain the average irradiance table that only depends on roughness:

![Eavg](../images/BRDF/EavgOrenNayar.png)


!!! info
    You can download [this table](MSBRDF_OrenNayar_Eavg128.csv) representing the $E_{avg}$ for different values of roughness.



##### Energy Conservation Check

We quickly check the energy is conserved by ensuring that for all roughness values of $\alpha \in [0,1]$ we have:

$$
\int_{\Omega_+} \left[ \int_{\Omega_+} \left( f_{r,oren-nayar}\left( \boldsymbol{\omega_o}, \boldsymbol{\omega_i}, \alpha \right) + f_{r,ms}\left( \boldsymbol{\omega_o}, \boldsymbol{\omega_i}, \alpha \right) \right)
(\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i \right]
(\boldsymbol{\omega_o} \cdot \boldsymbol{n}) d\omega_o = \pi
$$

!!! quote ""
	![CheckConvservation](../images/BRDF/MSBRDFOrenNayarCheck.png)

	Gray curve is the Oren-Nayar diffuse BRDF, blue curve is the "energy compensation BRDF", red curve is their sum that always yield $\pi$, thus ensuring the conservation of energy.

<br/>



### With varying Fresnel


## References

[^1]: Heitz, E. 2014 ["Understanding the Masking-Shadowing Function in Microfacets-based BRDFs "]()
[^2]: Heitz, E. Dupuy, J. Crassin, C. Dachsbacher, C. 2014 ["The SGGX Microflake Distribution"]()
[^3]: Heitz, E. d'Eon, E. 2014 ["Importance Sampling Microfacet-Based BSDFs using the Distribution of Visible Normals"]()
[^4]: Heitz, E. Hanika, J. d'Eon, E. Dachsbacher, C. 2015 ["Multiple-Scattering Microfacet BSDFs with the Smith Model"]()
[^5]: Kulla, C. Conty, A. 2017 ["Revisiting Physically Based Shading at Imageworks"](http://blog.selfshadow.com/publications/s2017-shading-course/imageworks/s2017_pbs_imageworks_slides.pdf)
[^6]: Kelemen, C. Szirmay-Kalos, L. 2001 ["A Microfact Based Coupled Specular-Matte BRDF Model with Importance Sampling"](https://pdfs.semanticscholar.org/658b/a4e43402545e5478ea5b8b2cdea3ebe59675.pdf)
[^7]: d'Eon, E. 2016 ["A Hitchhiker’s Guide to Multiple Scattering"](http://www.eugenedeon.com/hitchhikers)
[^8]: Walter, B. Marschner, S. R. Li, H. Torrance, K. E. 2007 ["Microfacet Models for Refraction through Rough Surfaces"](http://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf)
[^9]: Heitz, E. 2015 ["Generating Procedural Beckmann Surfaces"](https://drive.google.com/file/d/0BzvWIdpUpRx_U1NOUjlINmljQzg/view)
[^10]: Oren, M. Nayar, S. 1992 ["Generalization of the Lambertian Model and Implications for Machine Vision"](http://www1.cs.columbia.edu/CAVE/publications/pdfs/Nayar_IJCV95.pdf)
[^11]: Oren, M. Nayar, S. 1994 ["Generalization of Lambert's Reflectance Model"](http://www1.cs.columbia.edu/CAVE/publications/pdfs/Oren_SIGGRAPH94.pdf)