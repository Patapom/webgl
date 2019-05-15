﻿We often need to perform a numerical integration of a function $f(x)$.

It's really easy to lose oneself into technical terms and explanations about integration, Monte-Carlo integration, probability distribution functions (pdf), cumulative distribution functions (cdf), jacobians and that kind of stuff.
I, for one, am often completely at a loss whether I need to divide or not by the pdf, or account for weighting or not.


So let's be super clear, super fast!

We immediately state that all these methods are *equivalent*:

$$
\begin{align}
	&\int_a^b f(x) dx													\tag{1}\label{(1)}	\\\\
	&\approx \frac{b-a}{N} \sum_i^N f(a + (i-1) \frac{ (b-a) }{N} )		\tag{2}\label{(2)}	\\\\
	&\approx \frac{b-a}{N} \sum_i^N f( X_i )							\tag{3}\label{(3)}	\\\\
	&\approx \frac{1}{N} \sum_i^N \frac{f( X_i' )}{pdf( X_i' )}			\tag{4}\label{(4)}	\\\\
	&\approx \frac{1}{N} \sum_i^N \frac{f( X_i'' )}{pdf( X_i'' )}		\tag{5}\label{(5)}	\\\\
\end{align}
$$


Where:

* Equation $\eqref{(1)}$ is the actual integration we wish to perform
* Equation $\eqref{(2)}$ is the approximation of the integral using uniform sampling
* Equation $\eqref{(3)}$ is the approximation of the integral using basic Monte-Carlo sampling
* Equation $\eqref{(4)}$ is the approximation of the integral using Monte-Carlo sampling with weighting by the probability density function (pdf)
* Equation $\eqref{(5)}$ is the approximation of the integral using uniform weights and importance sampling


**NOTE**: Be careful of the $X_i$, $X'_i$ and $X''_i$ that are random variables that each follow a different distribution, as will be explained below.


## Details for each Method

### 1) The actual integral

Sometimes, it's possible that your function $f(x)$ is simple or chosen explicitly so that its antiderivate can be determined analytically.

If that's the case then great! You don't need any of the other methods to estimate the integral!


Most of the time, though, $f(x)$ is either unknown (e.g. you only have a black box that returns an output value for any input value), ill-determined or complex (e.g. most BRDFs), subject to external constraints that you have no control over (e.g. lighting).

For all theses cases, you have no other choice than doing a **numerical integration**, that is sampling your function at various places over its domain and apply some magic. That's what the methods described below are for.

But don't forget that after all, you're only computing an integral and that importance sampling and other advanced methods designed for reducing variance are only there to *optimize* the computation. You don't need them if you don't like them.
You can use method from eq. $\eqref{(2)}$ everywhere and still be fine! (although you won't have the fastest integration in the Universe).



### 2) Uniform Sampling

This technique is the simplest of all and it's also called the [Riemann sum](https://en.wikipedia.org/wiki/Riemann_sum).

![Riemann Sum](./images/RiemannSums.png)

This is the most basic way of performing the integration: you simply subdivide the integration domain into $N$ equal intervals, sample the function regularly along the interval and accumulate the area of each tiny rectangle along the way.

In the long run, with enough samples you get:

$$
\lim_{N \to \infty} \left( \sum_{i=1}^N f( x_i ) \Delta_x \right) = \int_a^b f(x) dx
$$

With $x_i = a + \frac{i-1}{N-1} (b - a)$ a regularly-spaced position in the domain $[a,b]$ and $\Delta_x = \frac{b-a}{N}$ the size of the base of the tiny rectangles.


**PROS**:

* Simple

**CONS**:

* Easy to miss tiny features if your interval is not fine enough, in which case you will need a *lot* of samples $N$ to properly cover the domain



### 3) Basic Monte-Carlo

As very well explained in [^1], the idea of Monte-Carlo integration is to sample your function $f(x)$ randomly all over the integration domain, pray that you have the best possible samples, and average the result.

![BasicMC](./images/MCIntegrationBasic.png)

In the end, if you have enough samples, it can be proven that:

$$
\lim_{N \to \infty} \left( \frac{b-a}{N} \sum_{i=1}^N f( X_i ) \right) = \int_a^b f(x) dx
$$

With $X_i = a + \xi (b-a)$ a *uniformly distributed* random number in the range $[a,b]$ and $\xi$ a *uniformly distributed* random number in the range $[0,1]$ (the number that is commonly returned by any good random generation function available in most languages).


**PROS**:

* Still very simple

**CONS**:

* Still easy to miss tiny features if you're not using enough samples
* No clear advantage over Riemann



### 4) General Monte-Carlo

Still following the explanation in [^1], we can state that the basic Monte-Carlo integration is okay as long as the distribution of the random variable is uniform.

This was the case earlier where we chose $X_i = a + \xi (b-a)$ and so the *probability distribution function* (pdf) for $X_i$ simply was $\frac{1}{b-a}$, meaning there is an equal chance to choose a sample anywhere in the integration domain.


Now, if we use another random variable $X'_i$ following an arbitrary distribution $pdf( X'_i )$ then the *general Monte-Carlo* integration is given by:

$$
\lim_{N \to \infty} \left( \frac{1}{N} \sum_{i=1}^N \frac{f( X'_i )}{pdf( X'_i )} \right) = \int_a^b f(x) dx
$$


So what does it bring us? Okay, it gives more weight to less probable samples so low-probability areas (i.e. with a low pdf) are properly accounted for in the integration; while high-probability areas (i.e. with a high pdf) have a not so important weight, as shown in the figure below.

![PDF](./images/samplespdf.png)

Well, to be honest, it doesn't bring anything in the balance to accelerate or increase the quality of the integration. The only thing it does really is *ensuring that whatever the distribution of random samples $X'_i$, 
they are all accounted for in the integral at their "just value" in order to avoid any bias*.

Basically, the division by the pdf simply tries to balance the samples so you end up *as if you had chosen a uniform distribution*.

So what's the point of doing that then?


**PROS**:

* Unbiased, whatever the pdf we may choose
* Scales very well to high dimensions

**CONS**:

* More difficult to understand
* Still not certain to cover all important features!
* pdf may not be readily available
* Very low-probability samples can have a very large weight because of the division, introducing noise
* Halving noise requires 4 times more samples


### 5) Importance Sampling

So all in all, what we've been doing until now is praying to pick the best random samples but that's not an effective way to choose random samples, isn't it?

That's where importance sampling comes into play: choose the best samples!

As elegantly put in [^2], Monte-Carlo integration is a stochastic process so even though we may know the pdf of a function, we cannot *choose* to place the samples where we deem they are more important than others,
otherwise we would bias the sampling and we would get an incorrect value for the integral.

Instead, we still must draw random numbers from our uniform random numbers generator and *bend* the distribution to make it draw more samples in the places that are more important (i.e. where the pdf is higher).


As a matter of fact, bending a distribution from uniform to any pdf is pretty easy by using the cumulative distribution function (cdf) which is given by this definition:

$$
\begin{align}
cdf( x ) &= \int_{-\infty}^{x} pdf( t ) dt	\\\\
cdf( x ) &= P( X \le x )	\qquad \text{Probability that} X \text{ is less than } x
\end{align}
$$

Also by definition, the cdf over the entire domain of the pdf sums to 1 (since the sum of the probabilities of all events should be 1):

$$cdf = \int_{-\infty}^{+\infty} pdf( t ) dt = 1$$


For example, the well-known GGX normal distribution function (which is in itself a probability distribution function) can be integrated into a CDF, as shown in the figure below:

!!! quote ""

	![CDF_GGX](./images/IS_CDF_GGX.png)

	The CDF for GGX as a function of $\theta$ for a roughness value $\alpha = 0.7$


So we know the cdf of the distribution we want to match. Then what?

Then we **invert** the CDF so a uniform random number $\xi \in [0,1]$ gets mapped into the target value $\theta \in [0,\frac{\pi}{2}]$ with the distribution we're expecting.

!!! quote ""

	![CDF_GGX](./images/IS_CDF_GGX_Inverted.png)

	The amazingly well done inversion of the cdf using a rotation + a flip of the above figure!


This effectively gives us our random value $X''_i$ from eq. $\eqref{(5)}$ that will help us to *target* our samples to the areas where they will be the most useful.


Basically, the integral is the same as the general Monte-Carlo formulation because this **is** the general Monte-Carlo formulation,
except we used a *tailored pdf* to target a specific distribution that will bring more samples to the interesting areas:

$$
\lim_{N \to \infty} \left( \frac{1}{N} \sum_{i=1}^N \frac{f( X''_i )}{pdf( X''_i )} \right) = \int_a^b f(x) dx
$$


**NOTE**: And interesting and important take away point in choosing a cdf for importance sampling is that you don't *have to* choose the exact pdf of your function, you just need to use a *good enough match*.


**PROS**:

* Sampling the domain is better covered, less risk of missing important features due to the use of the pdf instead of uniform probability

**CONS**:

* More difficult to understand
* pdf may not be readily available for all functions


## Some Practical Examples

### A "good enough pdf"

I'm using another great excerpt from [^2] where they give a nice example of a "good enough pdf" to show that it's always better to use even an average match to the function you want to integrate, than to use a uniform sampling.

![ISGoodEnough](./images/importancesamplingexample.png)

Here the function we wish to integrate is shown in red and is $f(x)=\sin(x)$. Its integral over $[0,\frac{\pi}{2}]$ simply yields 1.

Then we choose samples from 2 distributions:

* A uniform distribution ${pdf}_0(X_i) = \frac{1}{\frac{\pi}{2}} = \frac{2}{\pi}$ shown in green
* Another distribution ${pdf}_1(X_i) = \frac{8 x}{\pi^2}$ shown in blue that will attempt to match $f(X_i)$ a bit better


#### Uniform pdf

In the case of ${pdf}_0$ the cdf is simply ${cdf}_0(X_i) = \int_0^{X_i} {pdf}_0( X_i ) dx = \frac{2}{\pi} X_i$.

Now to invert the CDF we pose $\xi = {cdf}_0( X_i )$ then finding $X_i$ from $\xi$ is easy and is given by $X_i = \frac{\pi}{2} \xi$, with $\xi \in [0,1]$ a uniformly distributed random number.

And the Monte-Carlo sum will write:

$$
\int_0^\frac{\pi}{2} f(x) dx \approx \frac{1}{N} \sum_{i=1}^N \frac{ f( X_i ) }{ {pdf}_0( X_i ) } = \frac{\pi}{2 N} \sum_{i=1}^N \sin( X_i )
$$

#### Tailored pdf

In the case of ${pdf}_1$ the cdf is ${cdf}_1(X_i) = \int_0^{X_i} {pdf}_1( X_i ) dx = \frac{4}{\pi^2} X_i^2$.

Now to invert the CDF we pose $\xi = {cdf}_1( X_i )$ then finding $X_i$ from $\xi$ is easy and is given by $X_i = \frac{\pi}{2} \sqrt{ \xi }$, with $\xi \in [0,1]$ a uniformly distributed random number.

And the Monte-Carlo sum will write:

$$
\int_0^\frac{\pi}{2} f(x) dx \approx \frac{1}{N} \sum_{i=1}^N \frac{ f( X_i ) }{ {pdf}_1( X_i ) } = \frac{1}{N} \sum_{i=1}^N \frac{\sin( X_i ) \pi^2} {8 X_i}
$$

#### Results of the race

Now, for an equal amount of samples and the same random values $\xi$ used for both pdf's, here is the plot of the estimate of the integral:

![importancesampling_results.png](./images/importancesampling_results.png)


It's easy to see that importance sampling has a lower variance (i.e. deviation from the target) than uniform sampling, even with this crude estimate of the pdf of $f(x)$!



### Importance Sampling for GGX

Another important example of integration is the rendering equation:

$$
L( \boldsymbol{\omega_o} ) = \int_{\Omega^+} L( \boldsymbol{\omega_i} ) f( \boldsymbol{\omega_i}, \boldsymbol{\omega_o} ) (\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i
$$

Where:

* $\Omega^+$ is the upper hemisphere domain
* $\boldsymbol{\omega_i}$ is the incoming light unit vector
* $\boldsymbol{\omega_o}$ is the outgoing view unit vector
* $\boldsymbol{n}$ is the surface normal
* $L( \boldsymbol{\omega_i} )$ is the incoming radiance
* $L( \boldsymbol{\omega_o} )$ is the outgoing radiance
* $f( \boldsymbol{\omega_i}, \boldsymbol{\omega_o} )$ is the surface's BRDF


We can approximate this integral once again by using Monte-Carlo integration:

$$
\int_{\Omega^+} L( \boldsymbol{\omega_i} ) f( \boldsymbol{\omega_i}, \boldsymbol{\omega_o} ) (\boldsymbol{\omega_i} \cdot \boldsymbol{n}) d\omega_i \approx \frac{1}{N} \sum_{k=1}^N \frac{ L( \boldsymbol{\omega_{i_k}} ) f( \boldsymbol{\omega_{i_k}}, \boldsymbol{\omega_o} ) (\boldsymbol{\omega_{i_k}} \cdot \boldsymbol{n}) }{ pdf( \boldsymbol{\omega_{i_k}}, \boldsymbol{\omega_o} )}
$$

Each sample's direction $\boldsymbol{\omega_{i_k}}$ should be chosen according to a pdf that matches the integrand as closely as possible.

We often don't have any control over the incoming radiance (for example, in the case of a distant environment by a cube map, we don't know what's in the pixels beforehand!) so there's not much to do on this front.

For the BRDF though, we could choose a pdf that resembles the overall shape of the function.

#### Using the Normal Distribution Function as pdf

In the case of the Cook-Torrance micro-facet model and the specific case where the normal distribution function (NDF) is the Trowbrdige-Reitz (GGX) distribution, the NDF is easily integrable and, by definition, integrates to 1 over the hemisphere
(like all NDF's should, for the obvious reason of energy conservation):

$$
\begin{align}
N_{GGX}( \theta, \alpha ) = \frac{\alpha^2}{\pi ( \cos(\theta) (\alpha^2-1) + 1 )^2}	&\\\\
\int_0^{2\pi} \int_0^{\frac{\pi}{2}} N_{GGX}( \theta, \alpha ) \cos( \theta ) \sin( \theta ) d\theta d\phi &= 1
\end{align}
$$

Here, we use the spherical coordinates $\theta$ and $\phi$ that express the direction of the unit vector $\boldsymbol{\omega_i}$ on the hemisphere.
The cartesian coordinates of $\boldsymbol{\omega_i}$ are given by:

$$
\boldsymbol{\omega_i} = 
\begin{cases}
x = \sin(\theta) \cos(\phi) \\\\
y = \sin(\theta) \sin(\phi) \\\\
z = \cos(\theta) \\\\
\end{cases}
$$


We can then very conveniently use that NDF, along with the cosine weight as the pdf for our integration:

$$
pdf_{GGX}( \theta, \phi ) = N_{GGX}( \theta, \alpha ) \cos( \theta )
$$

Slight problem though, we're integrating on a 2D domain!

Gasp!


#### Multiple dimensions

We're not going to delve too deep into probablity theory here but in the general case, the pdf we must use for the denominator of our Monte-Carlo integration is called the **Joint Density**.

For multiple variables it's written as:

$$
P( A, B, C, D )	\quad \text{or} \\\\
P( A \cap B \cap C \cap D )
$$

It's the probability that all conditions A, B, C **and** D are satisfied (operative word is *and*).

When the variables A, B, C and D are dependent on each other, the joint density is written as:

$$
P(  A, B, C, D ) = P( A | B, C, D ) \cdot P( B | C, D ) \cdot P( C | D ) \cdot P( D )
$$

Where $P( A | B, C, D )$ is called the **conditional probability** of A given B, C and D have occurred. Identically, $P( B | C, D )$ is the conditional probability of B given C and D have occurred, and so on. </br>
The remaining probability $P(D)$ is called the **marginal probability**.


So basically, in our 2D case of integration over the hemisphere, we can write that:

$$
\begin{align}
pdf( \theta, \phi ) &= pdf( \theta | \phi ) \cdot pdf( \phi )	\qquad \text{or}	\\
pdf( \theta, \phi ) &= pdf( \phi | \theta ) \cdot pdf( \theta )
\end{align}
$$

It means that the probability to have a sample in the direction given by $\phi$ *and* $\theta$ is the product of the probabilty $P(\phi)$ of having a sample along the angle $\phi$ times the probability $P(\theta | \phi)$
of having a sample along the direction $\theta$ *knowing* we already have a sample along the angle $\phi$.

Or the reverse, the product of the probabilty $P(\theta)$ of having a sample along the angle $\theta$ times the probability $P(\phi | \theta)$
of having a sample along the direction $\phi$ *knowing* we already have a sample along the angle $\theta$, that also leads to the same joint probability (by the way, that's the base for Bayes theorem).


As we saw earlier, the cdf is given by:

$$
cdf( \bar{\theta}, \bar{\phi} ) = \int_0^{\bar{\phi}} \int_0^{\bar{\theta}} pdf( \theta, \phi ) \sin( \theta ) d\theta d\phi
$$

And so:

$$
\begin{align}
cdf( \bar{\theta}, \bar{\phi} ) &= \int_0^{\bar{\phi}} \int_0^{\bar{\theta}} pdf( \theta | \phi ) \cdot pdf( \phi ) \sin( \theta ) d\theta d\phi = \int_0^{\bar{\phi}} pdf( \phi ) \left[ \int_0^{\bar{\theta}} pdf( \theta | \phi )  \sin( \theta ) d\theta \right] d\phi	\qquad \text{or}	\\
cdf( \bar{\theta}, \bar{\phi} ) &= \int_0^{\bar{\phi}} \int_0^{\bar{\theta}} pdf( \phi | \theta ) \cdot pdf( \theta ) \sin( \theta ) d\theta d\phi = \int_0^{\bar{\theta}} pdf( \theta ) \left[ \int_0^{\bar{\phi}} pdf( \theta | \phi ) d\phi \right] \sin( \theta ) d\theta	\\
\end{align}
$$


Conducting the integration over the entire domain for *all* dimensions *but one* will yield the marginal probability:

$$
\begin{align}
P( \bar{\theta} ) &= \int_0^{2\pi} \int_0^{\bar{\theta}} pdf( \theta, \phi ) \sin( \theta ) d\theta d\phi	\qquad \text{or}	\\
P( \bar{\phi} ) &= \int_0^{\frac{\pi}{2}} \int_0^{\bar{\phi}} pdf( \theta, \phi ) \sin( \theta ) d\phi d\theta	\\
\end{align}
$$



#### Back to GGX

Let's rewrite the cdf using the GGX pdf we saw earlier:

$$
cdf( \bar{\theta}, \bar{\phi} ) = \int_0^{\bar{\phi}} \int_0^{\bar{\theta}} N_{GGX}( \theta, \alpha ) \cos( \theta ) \sin( \theta ) d\theta d\phi
$$


Conveniently enough, we only have a dependency on $\theta$ and, as explained in Tobias Alexander Franke's blog post [^3], we could simply choose to integrate of the entire $\phi \in [0,2\pi]$ domain to obtain the marginal probability distribution function $pdf(\bar{\theta})$:

$$
\begin{align}
pdf(\bar{\theta} ) &= \int_0^{2\pi} {pdf}_{GGX}( \theta, \phi ) d\phi  \\\\
pdf(\bar{\theta} ) &= \int_0^{2\pi} N_{GGX}( \theta, \alpha ) \cos( \theta ) d\phi  \\\\
pdf(\bar{\theta} ) &= (2\pi) N_{GGX}( \theta, \alpha ) \cos( \theta ) \\\\
pdf(\bar{\theta} ) &= (2\pi) {pdf}_{GGX}( \bar{\theta}, \bar{\phi} ) \\\\
\end{align}
$$

From what we saw earlier:

$$
\begin{align}
pdf( \theta, \phi ) &= pdf( \phi | \theta ) \cdot pdf( \theta )	\qquad \text{so}	\\
pdf( \phi | \theta ) &= \frac{pdf( \theta, \phi )}{pdf( \theta )}
\end{align}
$$

And we get:

$$
pdf( \phi | \theta ) = \frac{ {pdf}_{GGX}( \bar{\theta}, \bar{\phi} ) } { (2\pi) {pdf}_{GGX}( \bar{\theta}, \bar{\phi} ) } = \frac{1}{2\pi}
$$


##### Finding the cdf

Now that we know the expressions for $pdf( \theta )$ and $pdf( \phi | \theta )$, we can integrate these expressions to get the cumulative distribution functions for both of them:

$$
\begin{align}
cdf( \bar{\theta} ) &= 2\pi \int_0^{\bar{\theta}} N_{GGX}( \theta, \alpha ) \cos( \theta ) \sin( \theta ) d\theta \\
cdf( \bar{\theta} ) &= \frac{ 1 - \cos^2( \bar{\theta} ) } { (\alpha^2 - 1) \cos^2( \bar{\theta} ) + 1 }
\end{align}
$$

And:

$$
\begin{align}
cdf( \bar{\phi} | \bar{\theta} ) &= \int_0^{\bar{\phi}} \frac{1}{2\pi} d\phi \\
cdf( \bar{\phi} | \bar{\theta} ) &= \frac{\bar{\phi}}{2\pi}
\end{align}
$$


##### Inverting the cdf

If we pose that $\{ cdf( \bar{\theta} ), cdf( \bar{\phi} | \bar{\theta} ) \} = \{ \xi_0, \xi_1 \}$ where $\{ \xi_0, \xi_1 \} \in [0,1]$ is a set of 2 uniformly-distributed random variables
then it's simple enough to invert the expressions to find values for $\phi$ and $\theta$.

We get:

$$
\begin{align}
\bar{\theta} &= \sqrt{ \frac{ 1 - \xi_0 } { \xi_0 (\alpha^2 - 1) + 1 } }		\qquad and\\
\bar{\phi} &= 2\pi \xi_1
\end{align}
$$


<!--

 J( \theta_h, \theta_i )
Where $\theta_h$ is the angle between the normal and the half vector and $J( \theta_h, \theta_i )$ the Jacobian that gives the footprint of passing from the half-angle space to the incoming angle space...

Wait a minute! What the hell is this damn Jacombian doing here? (and what the hell is a Jacobian anyway?)


#### The Jacobian Menace

-->



@TODO: When to know if the pdf is included in the integration?



#### Result

@TODO: Show 2 examples of lighting integration, with and without importance sampling


## Stratified Sampling & Low-Discrepancy Sequences

Halton, van der Corput, Hammersley, Fibonnaci, etc.


## Multiple Importance Sampling


### Creating your own BRDF

Cosine-Weighted

On pose $t = cos2\left(\theta\right)$ du coup: $dt = -2.sin\left(\theta\right).cos\left(\theta\right)$

Parler du Jacobien, Walter 07.
http://www.stat.rice.edu/~dobelman/notes_papers/math/Jacobian.pdf


Quand on importance sample la direction de H, la réflexion de V ou L renvoie souvent sous l'hémisphère et donc le rayon est inutile et on doit le discarder
 ==> Ne peut-on pas bias l'importance sampling de manière à ne générer que des rayons sur l'hémisphère positif, mais avec la même distribution??



## Metropolis Hastings

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Metropolis-Hasting is a surprisingly simple way to sample from a density known only up to a constant. Defines a Markov chains whose stationary distribution is the target one. <a href="https://t.co/bUuHRASizo">https://t.co/bUuHRASizo</a> <a href="https://t.co/OnhhQ5X10l">pic.twitter.com/OnhhQ5X10l</a></p>&mdash; Gabriel Peyré (@gabrielpeyre) <a href="https://twitter.com/gabrielpeyre/status/977819766290309120?ref_src=twsrc%5Etfw">March 25, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[wikipedia](https://en.wikipedia.org/wiki/Metropolis%E2%80%93Hastings_algorithm)



## Quick Word

I'm one of those guys that "get things quickly but need a lot of explaining", and probabilities and importance sampling have been a real struggle for me.
Moreover, I have a tendency to forget things very easily and very quickly so these blog posts are not so much made to advertise stuff at the face of the world,
as they're a good way for me to remember information in my own words so I don't have to struggle as much the next time... :sweat_smile:

I hope this post is useful as it gathers (hopefully) clear information from all around in an attempt at clarifying what I find to be difficult concepts.


[^1]: Scratch a pixel [Monte Carlo Integration](https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/monte-carlo-methods-in-practice/monte-carlo-integration)
[^2]: Scratch a pixel [Importance Sampling](https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/monte-carlo-methods-in-practice/variance-reduction-methods)
[^3]: Franke, T. A. [Notes on Importance Sampling](https://www.tobias-franke.eu/log/2014/03/30/notes_on_importance_sampling.html)
