The cross-product is a strange beast.

## Do it that way

It's usually taught to you in 6th grade where you are told its 2D definition first:

![images/CrossProduct/Cross2D.jpg](../images/CrossProduct/Cross2D.jpg)

$$
\boldsymbol{u} = ( u_x, u_y, 0 ) ~~~~~~~~~~ \boldsymbol{v} = ( v_x, v_y, 0 ) ~~~~~~~~~~ \boldsymbol{w}= \boldsymbol{u} \times \boldsymbol{v} = (0, 0, u_x  v_y - u_y  v_x )
$$

You are also told that $\Vert\boldsymbol{w}\Vert = \Vert\boldsymbol{u}\Vert \Vert\boldsymbol{v}\Vert sin(\alpha)$ and that the resulting vector $\boldsymbol{w}$ is orthogonal to its base constituents $\boldsymbol{u}$ and $\boldsymbol{v}$.

Then everyone in the classroom starts doing some strange gestures with their fingers to understand which way the vector should point to, something about the "right hand rule", clockwise rotation, counter-clockwise rotation, etc.

And then you start using it everywhere because as soon as you need something orthogonal to another, the cross-product immediately pops into your mind.


## But why?

Why introduce such a tool? Where does it come from? Is it really necessary? Isn't the $u_x  v_y - u_y  v_x$ part a bit arbitrary?

The [history section of the Wikipedia page](https://en.wikipedia.org/wiki/Cross_product#History) says the dot and cross product were apparently introduced by Lagrange in order to study the tetrahedron in three dimensions.
Obviously, you start imagining the area of a tetrahedron, some parallelograms come to mind, the [wedge product](https://en.wikipedia.org/wiki/Exterior_algebra), areas, volumes, tensors, group theory and whatnots, etc.

And you're no closer to an idea than when you started... I won't pretend I will provide a brilliant explanation of "why the cross product" either, just adding oil to the thought process here.


## Factorizing the Tools

As a programmer, there is nothing I hate more than duplicate code... And I claim that the cross product is nothing more than a duplicate tool: the essential original tool being the dot product!

Why bother learning a new notation? Only because it's found in many places? Why not calling it the "orthogonal dot product" at the very least?
Because it would seem that most people forgot the cross product is really the dot product but rewrote in another way. Let me explain.

When we write:

$$
u_x  v_y - u_y  v_x
$$

Aren't we actually doing the dot product?

$$
u_x (v_y) + u_y (-v_x) = \boldsymbol{u} \cdot \boldsymbol{n}
$$

With $\boldsymbol{n}=( v_y, -v_x, 0 )$

I chose the symbol $\boldsymbol{n}$ on purpose, to show that this vector is actually the **normal** vector to our original $\boldsymbol{v}$ vector:

![NormalVector.jpg](../images/CrossProduct/Cross2DNormal.jpg)

We know that $\boldsymbol{u} \cdot \boldsymbol{n} = \Vert\boldsymbol{u}\Vert \Vert\boldsymbol{n}\Vert cos(\alpha')$ and, from the figure we can see that $\alpha' = \alpha-\frac{\pi}{2}$ and thus,
 indeed, $cos(\alpha') = cos(\alpha-\frac{\pi}{2}) = sin(\alpha)$ and we find back the original expression:

$$
\Vert\boldsymbol{w}\Vert = u_x  v_y - u_y  v_x = \boldsymbol{u} \cdot \boldsymbol{n} = \Vert\boldsymbol{u}\Vert \Vert\boldsymbol{n}\Vert cos(\alpha') = \Vert\boldsymbol{u}\Vert \Vert\boldsymbol{v}\Vert sin(\alpha)
$$


## So what is it then?

We just saw that the cross-product is nothing more than a mere dot product with a vector $\boldsymbol{n}$ normal to the original vector $\boldsymbol{v}$.
As the dot product measures the alignment of 2 vectors (*i.e.* the alignment being maximum when the dot product is 1 in absolute value), and since we're measuring the alignment of a vector $\boldsymbol{n}$ that is orthogonal to $\boldsymbol{v}$, then we're actually measuring the orthogonality of the two vectors $\boldsymbol{u}$ and $\boldsymbol{v}$.

**Claim**: The cross product is just a twist of the dot product to measure "how much two vectors are orthogonal from each other".


## Three Dimensions

In 3 dimensions, the arbitrary nature of the operations you are told to remember is at its maximum!

![Cross3D.jpg](../images/CrossProduct/Cross3D.jpg)


Indeed, if you have:

$$
\boldsymbol{u} = ( u_x, u_y, u_z ) ~~~~~~~~~~ \boldsymbol{v} = ( v_x, v_y, v_z )
$$

Then, get ready... The cross product $\boldsymbol{u} \times \boldsymbol{v}$ is given by:

$$
 ~~~~~~~~~~ \boldsymbol{w}= \boldsymbol{u} \times \boldsymbol{v} =\begin{cases}
u_y v_z - u_z v_y\\\\
u_z v_x - u_x v_z\\\\
u_x v_y - u_y v_x\\\\
\end{cases}
$$

You easily see the patterns, the rotations and permutations that are necessary to retrieve the result. You memorize it and you retrieve it each time you need it.

But one more time, I claim these are just 3 little dot products in disguise:

$$
 ~~~~~~~~~~ \boldsymbol{w}= \boldsymbol{u} \times \boldsymbol{v} =\begin{cases}
u_y (v_z) + u_z (-v_y) = u_y n_y + u_z n_z = \boldsymbol{u_{yz}} \cdot \boldsymbol{n_{yz}}\\\\
u_z (v_x) + u_x (-v_z) = u_z n_z + u_x n_x = \boldsymbol{u_{zx}} \cdot \boldsymbol{n_{zx}}\\\\
u_x (v_y) + u_y (-v_x) = u_x n_x + u_y n_y = \boldsymbol{u_{xy}} \cdot \boldsymbol{n_{xy}}\\\\
\end{cases}
$$

With $\boldsymbol{u_{yz}} = \begin{cases}u_y\\\\u_z\end{cases} ~~~~~$
$\boldsymbol{u_{zx}} = \begin{cases}u_z\\\\u_x\end{cases} ~~~~~$
$\boldsymbol{u_{xy}} = \begin{cases}u_x\\\\u_y\end{cases}$

And
$\boldsymbol{n_{yz}} = \begin{cases}v_z\\\\-v_y\end{cases} ~~~~~$
$\boldsymbol{n_{zx}} = \begin{cases}v_x\\\\-v_z\end{cases} ~~~~~$
$\boldsymbol{n_{xy}} = \begin{cases}v_y\\\\-v_x\end{cases}$

Each little dot product is actually measuring **how much 2D sub-vectors are orthogonal from each other along each axis**, each in their own 2D sub-space XY, YZ, ZX.

![Cross3D-SubSpaces.jpg](../images/CrossProduct/Cross3D-SubSpaces.jpg)


* The X coordinate equals how much the 2D vectors are orthogonal from each other in the complementary 2D sub-space YZ
* The Y coordinate equals how much the 2D vectors are orthogonal from each other in the complementary 2D sub-space ZX
* The Z coordinate equals how much the 2D vectors are orthogonal from each other in the complementary 2D sub-space XY


## Orthogonality

Building a new 3D vector this way is actually yielding a vector that is orthogonal to the other two base vectors (unless the 2 base vectors are colinear).
Obviously, there are only 6 possible permutations of different triplets of vector components for arbitrary vectors $\boldsymbol{u}$, $\boldsymbol{v}$ and $\boldsymbol{w}$:

$~~~~u_x v_y w_z$

$~~~~u_y v_z w_x$

$~~~~u_z v_x w_y$

$~~~~u_x v_z w_y$

$~~~~u_y v_x w_z$

$~~~~u_z v_y w_x$


And they all find their expression as positive and negative quantities when writing the dot product of $\boldsymbol{w}$ with the resulting cross product $\boldsymbol{u} \times \boldsymbol{v}$:

$\boldsymbol{w} \cdot (\boldsymbol{u} \times \boldsymbol{v}) = u_y v_z w_x - u_z v_y w_z + u_z v_x w_y - u_x v_z w_y + u_x v_y w_z - u_y v_x w_z$


Whenever $\boldsymbol{w}$ turns out to be $\boldsymbol{w} = \boldsymbol{u}$ or $\boldsymbol{w} = \boldsymbol{v}$, the quantities find balancing positive and negative quantities that eventually vanish, thus proving that the 
vector resulting from the cross product construction is indeed orthogonal to its base construction vectors $\boldsymbol{u}$ and $\boldsymbol{v}$.



## Higher Dimensions

So we gathered interesting information so far:

1. The cross product is actually a collection of dot $N$ products, $N$ being the amount of dimensions of our space
2. Each dot product is performed between the original vector $\boldsymbol{u}$ and a "normal vector" $\boldsymbol{n}$ that is derived from the original vector $\boldsymbol{v}$ by permutations and optional sign changes of the components of $\boldsymbol{v}$
3. The $N$ dot products from point 2. are performed between vectors of dimension $N-1$, each of these vectors $\boldsymbol{n_i}$ and $\boldsymbol{v_i}$ being expressed in the sub-space $i \in [1,N]$ excluding the dimension $i$ itself
 (*e.g.* $\boldsymbol{n_0}=\boldsymbol{n_{yz}}$ in dimension 3 is a combination of components from axes $Y$ and $Z$, excluding axis $X$)
4. Dotting the vector $\boldsymbol{w}$ resulting from the cross product with either one of the base vectors $\boldsymbol{u}$ and $\boldsymbol{v}$ must yield 0

Assuming these rules apply for any dimension, then...


### Odd Dimensions

From point 2., we can write $\boldsymbol{n} \cdot \boldsymbol{v} = 0$.

In order for this to be possible, we use point 3. to notice that we **must have sub-vectors of even dimension** for terms coupling and canceling to occur!

Indeed, for example in 4 dimensions, we would build our cross product as:

$$
\boldsymbol{w} = \begin{cases}
\boldsymbol{u_{yzw}} \cdot \boldsymbol{n_{yzw}}\\\\
\boldsymbol{u_{zwx}} \cdot \boldsymbol{n_{zwx}}\\\\
\boldsymbol{u_{wxy}} \cdot \boldsymbol{n_{wxy}}\\\\
\boldsymbol{u_{xyz}} \cdot \boldsymbol{n_{xyz}}
\end{cases}
$$

And for any of these 4 cases, we could write something like this expression:

$$
\boldsymbol{v_{xyz}} \cdot \boldsymbol{n_{xyz}} = 0
$$

But whatever the way we may construct the vector $\boldsymbol{n_{xyz}}$, we will never find any combination so that:

$$
v_x.? + v_y.? + v_z.? = 0
$$

Simply because we need an even amount of terms for that to be possible.

!!! note
    This leads to the very interesting remark that **cross products only exist for odd dimensions** 3, 5, 7 and so on.
	(you may object the 2D case but we're doing a 3D cross product with planar 2D vectors really, the true 2D cross-product doesn't exist)
	(interestingly, the 1D cross product is simply the product of two scalars :smile:)

And indeed, for odd dimensions you get sub-space vectors of even dimensions and you can then have terms coupling that cancel each other.

For example, for 5 dimensions you can write the cross product as:

$$
\boldsymbol{w} = \begin{cases}
\boldsymbol{u_{yzwt}} \cdot \boldsymbol{n_{yzwt}}\\\\
\boldsymbol{u_{zwtx}} \cdot \boldsymbol{n_{zwtx}}\\\\
\boldsymbol{u_{wtxy}} \cdot \boldsymbol{n_{wtxy}}\\\\
\boldsymbol{u_{txyz}} \cdot \boldsymbol{n_{txyz}}\\\\
\boldsymbol{u_{xyzw}} \cdot \boldsymbol{n_{xyzw}}
\end{cases}
$$

Selecting the simple case $\boldsymbol{v_{xyzw}} \cdot \boldsymbol{n_{xyzw}} = 0$ implies the construction of the normal vector to satisfy:

$$
\boldsymbol{v_{xyzw}} \cdot \boldsymbol{n_{xyzw}} = v_x.? + v_y.? + v_z.? + v_w.? = 0
$$

And this can only happen in the following cases:

$$
\boldsymbol{n_{xyzw}} =
\begin{cases}
\pm v_y \\\\
\mp v_x \\\\
\pm v_w \\\\
\mp v_z
\end{cases}
$$

$$
\boldsymbol{n_{xyzw}} =
\begin{cases}
\pm v_z \\\\
\mp v_w \\\\
\pm v_x \\\\
\mp v_y
\end{cases}
$$

$$
\boldsymbol{n_{xyzw}} =
\begin{cases}
\pm v_w \\\\
\mp v_z \\\\
\pm v_y \\\\
\mp v_x
\end{cases}
$$


It's quite easy to notice that for any odd dimension $N=2k+1$, the number of possible combinations for constructing a normal vector is equal to $(2k-1) . 2^k$.

--> The term $2k-1$ is due to the number of possible swaps of even sub-space dimensions (*i.e.* $2k$) without including your own dimension (*i.e.* in 3D, $x$ can use $y$ and $z$ but not itself, so $-1$).

--> The term $2^k$ is the amount of sign binary permutations (so $2^x$) for each pair (so $\frac{2k}{2} = k$ as exponent)


## Only special odd dimensions

According to [wikipedia](https://en.wikipedia.org/wiki/Seven-dimensional_cross_product), the next space where a cross product is available is in 7D!


