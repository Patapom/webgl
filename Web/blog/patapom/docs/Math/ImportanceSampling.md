We often need to perform a numerical integration of a function $f(x)$.

It's really easy to lose oneself into technical terms and explanations about integration, Monte-Carlo integration, probability distribution functions (pdf), cumulative distribution functions (cdf), jacobians and that kind of stuff.
I, for one, am often completely at a loss whether I need to divide or not by the pdf, or account for weighting or not.

So let's be super clear, super fast!

We immediately state that all these methods are *equivalent*:

$$
\begin{align}
	&\int_a^b f(x) dx													\tag{1}\label{(1)}	\\\\
	&\approx \frac{b-a}{N} \sum_i^N f(a + (i-1) \frac{ (b-a) }{N} )		\tag{2}\label{(2)}	\\\\
	&\approx \frac{b-a}{N} \sum_i^N f( X_i )							\tag{3}\label{(3)}	\\\\
	&\approx \frac{b-a}{N} \sum_i^N \frac{f( X_i' )}{pdf( X_i' )}		\tag{4}\label{(4)}	\\\\
	&\approx \frac{1}{N} \sum_i^N f( X_i'' )							\tag{5}\label{(5)}	\\\\
\end{align}
$$


Where:

* Equation $\eqref{(1)}$ is the actual integration we wish to perform
* Equation $\eqref{(2)}$ is the approximation of the integral using uniform sampling
* Equation $\eqref{(3)}$ is the approximation of the integral using basic Monte-Carlo sampling
* Equation $\eqref{(4)}$ is the approximation of the integral using Monte-Carlo sampling with weighting by the probability density function (pdf)
* Equation $\eqref{(5)}$ is the approximation of the integral using uniform weights and importance sampling


## Details for each Method

### 1) The actual integral

Sometimes, it's possible that your function $f(x)$ is simple or chosen explicitly so that its antiderivate can be determined analytically.

If that's the case then great! You don't need any of the other methods to estimate the integral!


Most of the time, though, $f(x)$ is either unknown (e.g. you only have a black box that returns an output value for any input value), ill-determined or complex (e.g. most BRDFs), subject to external constraints that you have no control over (e.g. lighting).

For all theses cases, you have no other choice than doing a **numerical integration**, that is sampling your function at various places over its domain and apply some magic. That's what other methods described below are for.

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

With $X_i = a + \xi (b-a)$ a *uniformly distributed* random number in the range $[a,b]$ and $\xi$ a *uniformly distributed* random number in the range $[0,1]$ (the number that is commonly returned by any good random function available in most languages).


**PROS**:

* Still very simple

**CONS**:

* Still easy to miss tiny features if you're not using enough samples
* No clear advantage over Riemann



### 4) General Monte-Carlo

Still following the explanation in [^1], we can state that the basic Monte-Carlo integration is okay as long as the distribution of the random variable is uniform.

This was the case earlier where we chose $X_i = a + \xi (b-a)$ and so the *probability distribution function* (pdf) for $X_i$ simply was $\frac{1}{b-a}$, meaning there is an equal chance to choose a sample anywhere in the integration domain.


Now, if another random variable $X'_i$ follows an arbitrary distribution $pdf( X'_i )$ then the *general Monte-Carlo* integration is given by:

$$
\int_a^b f(x) dx \approx \sum_{i=1}^N \frac{f( X'_i )}{pdf( X'_i )}
$$


**PROS**:

* Less samples needed due to weighting by $\frac{1}{pdf}$ 

**CONS**:

* Still not certain to cover all important features!
* More difficult to understand
* pdf may not readily available
* Very low-probability samples can have a very large weight because of the division, introducing noise


<!--* Sampling the domain is better covered, less risk of missing important features due to the use of the pdf instead of uniform probability-->


### 5) Importance Sampling

Praying to have the best random samples is not an effective way to choose random samples, isn't it?

That's where importance sampling comes into play: choose the best samples!



## Importance Sampling


### Cosine-Weighted

On pose $t = cos2\left(\theta\right)$ du coup: $dt = -2.sin\left(\theta\right).cos\left(\theta\right)$

Parler du Jacobien, Walter 07.
http://www.stat.rice.edu/~dobelman/notes_papers/math/Jacobian.pdf


Quand on importance sample la direction de H, la réflexion de V ou L renvoie souvent sous l'hémisphère et donc le rayon est inutile et on doit le discarder
 ==> Ne peut-on pas bias l'importance sampling de manière à ne générer que des rayons sur l'hémisphère positif, mais avec la même distribution??


## Metropolis Hastings

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Metropolis-Hasting is a surprisingly simple way to sample from a density known only up to a constant. Defines a Markov chains whose stationary distribution is the target one. <a href="https://t.co/bUuHRASizo">https://t.co/bUuHRASizo</a> <a href="https://t.co/OnhhQ5X10l">pic.twitter.com/OnhhQ5X10l</a></p>&mdash; Gabriel Peyré (@gabrielpeyre) <a href="https://twitter.com/gabrielpeyre/status/977819766290309120?ref_src=twsrc%5Etfw">March 25, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[wikipedia](https://en.wikipedia.org/wiki/Metropolis%E2%80%93Hastings_algorithm)



[^1]: Scratch a pixel [Monte Carlo Integration](https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/monte-carlo-methods-in-practice/monte-carlo-integration)
