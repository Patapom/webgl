# Disk & Spherical Optimization for LTC Area Lights

In 2016, Heitz et al. introduced Linearly-Transformed Cosines (LTC) [^1], a simple technique to provide area lighting for various types of BRDF at the cost of a lookup table and a simple 3x3 matrix transform.

The idea is relatively simple:

1. Transform the coordinates of a polygonal light source into a canonical space where it's easier to compute the luminance integration
2. Apply the polygonal irradiance vector equation in that simplified space

<br/>
In a second paper from 2017 [^2], Heitz & Hill proposed an update for line and disk area lights, which is the part we will focus on in this small article.

First, Heitz notices that spherical lights can always be replaced with disks covering the same solid angle:

![spheredisk](./images/Sphere2Disk.png)


Next, Heitz generalizes the problem of solving sphere and disk area lights into the unique problem of solving for ellipses:

![Ellipsoid2Ellipse](./images/Ellipsoid2Ellipse.png)


Unfortunately, this generalization to ellipses leads to a code that is quite heavy to evaluate in a shader and that is prone to precision issues.
Also, it requires a highly-specialized code that deviates from the simple irradiance vector formulation used in all other area light types which prevents a nice general uniform and simple code path that compilers are fond of.


In this article, instead of computing a general solution with ellipses, we will extend the LTC philosophy and introduce a new simple transform that will bring the difficult general case of ellipses into yet another simple
canonical space where we will compute the solution.


## Review

First, let's review some essential notions.

### Vector Irradiance

In 1939, Gershun [^3] introduced the vector field known as "the light field" defining a vector quantity $\boldsymbol{\Phi}(\boldsymbol{x})$ for all point in space $\boldsymbol{x}$ as:

$$
\boldsymbol{\Phi}(\boldsymbol{x}) = \int_{\Omega} L(\boldsymbol{x}, \boldsymbol{\omega_i}) \boldsymbol{\omega_i} d\omega_i
$$

Where:

* $\Omega$ represents the unit sphere domain in $\mathbb{R}^3$
* $\boldsymbol{\omega_i}$ represents a unit incoming direction vector
* $d\omega_i$ represents the solid angle subtended by $\boldsymbol{\omega_i}$
* $L(\boldsymbol{x}, \boldsymbol{\omega_i})$ represents the radiance received at point $\boldsymbol{x}$ in direction $\boldsymbol{\omega_i}$

<br/>

$\boldsymbol{\Phi}(\boldsymbol{x})$ is called the ***vector irradiance*** which is a very important quantity from which we can derive the scalar flux of irradiance passing through a surface with normal $\boldsymbol{n}$:

$$
\phi(\boldsymbol{x},\boldsymbol{n}) = \int_{\Omega} L(\boldsymbol{x}, \boldsymbol{\omega_i}) \left( \boldsymbol{\omega_i} \cdot \boldsymbol{n} \right) d\omega_i = -\boldsymbol{\Phi}(\boldsymbol{x}) \cdot \boldsymbol{n}
$$

The scalar value $\phi(\boldsymbol{x},\boldsymbol{n})$ is well known to the computer graphics community as we familiarly call it the (scalar) irradiance.



### Code for disk of equivalent solid angle

Here we show how to convert any spherical area light into a front-facing disk covering the same solid angle.

We start from the following construction of the sphere centered in $C$ of radius $R$ seen from point $P$ at distance $D$:

![Spher2DiskSchema.png](./images/Spher2DiskSchema.png)


Without changing the position of the light $C$, we're looking for the new radius $R'$ shown in red, covering the same solid angle as the sphere and facing the point $P$ so the disk's normal is aligned with $\left<PC\right>$.

Re-orienting the disk is quite straightforward, we're going to use Frisvad's method.

Now, knowing the distance $D$ and radius $R$, we can write:

$$
\begin{align}
sin(\alpha) &= \frac{R}{D}	\\
tan(\alpha) &= \frac{R'}{D}	
\end{align}
$$

From there, we easily get:

$$
R' = D \frac{R}{\sqrt{D^2 - R^2}}
$$


Which is done by the HLSL code below:

??? "Sphere to Disk (HLSL)"
	``` C++

	// Build orthonormal basis from a 3D Unit Vector Without normalization [Frisvad2012])
	void BuildOrthonormalBasis( float3 _normal, out float3 _tangent, out float3 _bitangent ) {
		float a = _normal.z > -0.9999999 ? 1.0 / (1.0 + _normal.z) : 0.0;
		float b = -_normal.x * _normal.y * a;

		_tangent = float3( 1.0 - _normal.x*_normal.x*a, b, -_normal.x );
		_bitangent = float3( b, 1.0 - _normal.y*_normal.y*a, -_normal.y );
	}

    // The sphere is only a front-facing disk so let's rebuild a local frame for that disk and compute its radius
	float3		P = world-space position of the point we're lighting
	float3		C = world-space position of the spherical light
	float		R = world-space radius (in meters) of the spherical light

    float3      wsLight = wsLightPosition - wsSurfacePosition;
    float       D = length(wsLight);
                wsLight *= D > 1e-3 ? 1.0 / D : 1.0;

    // Re-orient the disk to face our position
	float3	wsLightTangent, wsLightBiTangent;
	BuildOrthonormalBasis( -wsLight, wsLightTangent, wsLightBiTangent );

    // Then we recompute the disk's radius and intensity to match the solid angle covered by the sphere
    if ( D - R > 1e-3 ) {
        float   tanTheta = R * rsqrt( saturate( D*D - R*R ) );
        R = D * tanTheta;			// New disk radius when standing at distance D
    } else {
        lightLuminance = 0.0;		// Inside the disk: reduce intensity to 0
    }
	```


## Simpler Formulation

So the idea of LTC is to transform the general case of 

The idea 




## References

[^1]: 2016 Heitz, E. Dupuy, J. Hill, S. Neubelt, D. ["Real-Time Polygonal-Light Shading with Linearly Transformed Cosines"](https://eheitzresearch.wordpress.com/415-2/)
[^2]: 2017 Heitz, E. Hill, S. ["Real-Time Line- and Disk-Light Shading with Linearly Transformed Cosines"](https://blog.selfshadow.com/publications/s2017-shading-course/heitz/s2017_pbs_ltc_lines_disks.pdf)
[^3]: 1939 Gershun, A. ["The Light Field"](https://qcloud.coding.net/u/vincentqin/p/blogResource/git/raw/master/light-field-depth-estimation/1.Gershun-1939-Journal_of_Mathematics_and_Physics.pdf)
[^4]: 1995 Arvo, J. ["Applications of Irradiance Tensors to the Simulation of Non-Lambertian Phenomena"](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.89.2596&rep=rep1&type=pdf)
[^3]: 1989 Baum, D.R. Rusheimer, H. E. Winget, J. M. ["Improving radiosity solutions through the use of analytically determined form-factors"](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.466.963&rep=rep1&type=pdf)


Source "Real-Time Line- and Disk-Light Shading with Linearly Transformed Cosines"
