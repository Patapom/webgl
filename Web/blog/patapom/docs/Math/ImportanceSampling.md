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
