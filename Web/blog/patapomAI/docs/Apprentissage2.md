(8 octobre 2024)

# Apprentissage (part 2)

Nous voilà des mois plus tard et mon idée centrale pour l'algo d'apprentissage tient bon !

Le principe est toujours le même : on associe et on renforce un concept dès lors qu'on observe une ou plusieurs propriétés communes associées à des "choses".
Plus on observe ces propriétés, et plus le concept en sort renforcé et plus notre **crédence** dans ce concept augmente.

Cela s'applique à tout :

* Vision => Renforcement de la perception des éléments visuels composant un objet
* Audio => Renforcement de la signature de certains phonèmes malgré les différents locuteurs
* Langage
	* Syntaxe => 
	* Grammaire =>
	* Phonétique => 
* Symbolique / Conceptuel =>


## Surprise

La notion de **surprise** pointe également le bout de son nez partout où j'essaie d'appliquer cet algo d'apprentissage.

Par "surprise" j'entends la composante $I(x) = log_2( \frac{1}{p(x)} )$, également appelée "auto-information", qui entre en jeu dans le calcul de l'entropie:

$$
S = \sum_x{ p(x) \cdot log_2( \frac{1}{p(x)} ) }
$$

En effet, les phénomènes très fréquents (avec une grande probabilité d'existence) vont venir "polluer" l'algorithme d'apprentissage puisqu'ils vont intervenir assez souvent et perturber les autres mesures.

C'est le cas par exemple avec la lettre 'e', le phonème [ʀ] ou le mot "le", très courants dans la langue française.

Il est donc naturel de vouloir pondérer l'importance de ces évènements par la surprise qu'ils dégagent : un événement très fréquent va simplement avoir moins d'influence qu'un événement plus rare.


## Signal to Noise Ratio

On peut vouloir faire le parallèle entre la signification et le signal, tandis que les données seraient le noise.

Effectivement, la mer est calme là-haut, au niveau symbolique, quand on a clairement identifié les objets présents dans les images qui innondent perpétuellement notre rétine d'un bruit de pixels confus desquels on tire difficilement des contours et des formes fixes.


## Delta Vision

Encore une fois, au niveau de la vision, on cherche à trouver les **points fixes** d'une scène pour en déduire la présence d'objets entiers :

* La vision binoculaire permet de faire la mise au point sur des plans focaux (c'est-à-dire qu'on fait la *différence* entre l'image gauche et droite), 
	les choses nettes étant automatiquement classifiées comme faisant partie du même objet, car les grandeurs des "pixels" de l'objet dans les 2 images ont à peu près les mêmes valeurs
	 => Expérience à tenter : soustraire 2 images binoculaires blurrées, voir là où c'est noir = objet net ?

* La parallaxe, quand on bouge la tête (ex: le hibou), permet d'augmenter la précision et la certitude de la présence d'un objet : les objets résidants sur le même plan focal vont très peu bouger,
	tandis que les objets hors du plan focal vont se déplacer énormément.

* Scène en mouvement : même principe que pour la vision parallaxe. Il est "aisé" de détecter les choses qui ont bougé d'un instant à l'autre dans une scène fixe
	=> Expérience à tenter : soustraire 2 images blurrées où un objet aura bougé dans une scène fixe
	=> Ici, il s'agit d'un *apprentissage direct", où l'on se focalise sur une seule chose et où l'on ignore tout le reste

* Si nous somme nous-mêmes en mouvement, notre proprioception et notre perception nous aident à compenser/anticiper la façon dont la scène qu'on voit va se transformer.
	=> Expérience à tenter : soustraire 2 images blurrées où un objet est fixe dans une scène qui bouge (càd où la caméra aura bougé)
	=> Encore une fois, on voit intervenir le principe *d'apprentissage inverse*, où l'on se focalise sur la seule chose qui n'aura pas bougée


## Catégorisation des Types d'Apprentissage



### Apprentissages Supervisés

Ces types d'apprentissages nécessitent toujours un **tuteur** auquel on va accorder une *confiance*.

Le tuteur peut être :

* Une personne, qui va nous fournir des exemples de choses à apprendre. C'est le cas des professeurs ou des livres d'école par exemple.

* La réalité elle-même, qui nous fournit en permanence des "exemples" d'un instant à l'autre pour nous apprendre toutes sortes de choses (les limites de notre propre corps, la gravité, la dureté, la chaleur, la couleur, etc.)


C'est un apprentissage relativement simple pour l'élève mais complexe pour le tuteur puisque tout le poids de la charge réside sur ses épaules :
 c'est le tuteur qui va devoir trouver tous les exemples d'apprentissage intéressants !

À noter que dans le cas de la réalité, elle se contente simplement de suivre son cours en fournssant une suite d'évènements, mais ils ne sont pas forcéments tous intéressants...
Encore une fois, un tuteur humain pourrait faire le travail d'aller isoler les moments intéressants dans un épisode de réalité, mais cet épisode sera toujours emprunté et réduit par rapport à *vivre* cet épisode.


#### Apprentissage Direct

On cherche **un seul** point commun entre 2 exemples qu'on nous présente.

Ex tuteur humain :
 J'écris le mot "pain" et le mot "levain", et je les prononce [pɛ̃] et [ləvɛ̃].
 => L'élève peut en déduire que le groupe de lettres "ain" se prononce [ɛ̃].

Ex réalité :
 La réalité présente une situation avec un rond rouge, puis une autre avec un carré rouge.
 => L'élève peut apprendre la notion de rouge, indépendante de la forme de l'objet.


#### Apprentissage Inverse

On cherche la seule chose qui **diffère** entre 2 exemples qu'on nous présente.

Ex tuteur humain :
 J'écris les phrases suivantes "Le chat mange la souris" et "Le chien mange la souris". Je les traduis en chinois : "猫吃老鼠" et "狗吃老鼠".
 => L'élève peut en déduire les idéogrammes pour "chat" (猫) et "chien" (狗)

Ex réalité :
 La réalité nous présente une scène fixe, puis l'instant d'après, un objet a bougé dans cette scène.
 => L'élève peut en déduire les contours, la position et la vitesse de l'objet.


### Apprentissages Non-Supervisés

Cette fois-ci, c'est un apprentissage très simple pour le tuteur mais extrêmement complexe pour l'élève.

Le tuteur donne :

* Un jeu de données
* Un but à atteindre
* Un ensemble de règles et de contraintes

L'élève est ensuite chargé d'atteindre le but en partant des données tout en suivant les règles et en obéissant aux contraintes qu'on lui a données.


### Apprentissage Complet

C'est un apprentissage extrêmement complexe puisque chaque modification d'une **hypothèse** a une implication sur toutes les autres !


Par exemple, on essaie de faire apprendre la prononciation des mots de la langue française.

* On connaît un ensemble de mots et leur(s) prononciation(s) (il peut parfois y avoir plusieurs prononciations possibles pour un même mot).
* On a les règles suivantes :
	* Un groupe de phonèmes correspond à un groupe de lettres
	* 2 groupes de même index sont correspondants
	* L'ordre des groupes doit respecter l'ordre de la séquence de phonèmes/lettres
	* Il y a autant de groupes de phonèmes que de groupes de lettres
	* Un phonème/une lettre ne peut pas appartenir à plusieurs groupes
	* La somme des phonèmes/lettres de tous les groupes doit égaler la séquence de phonèmes/lettres complète


#### Distributions Discrètes

Pour l'élaboration de nos **hypothèses**, on va avoir besoin d'évaluer leur probabilité, et pour ce faire on va avoir besoin de **distributions discrètes**.

C'est simplement une collection d'événements $x_i$ auxquels on associe un compteur d'occurrences $c_i$:

$$
H = \{ x_i, c_i | i \in \mathbb{S} \} \\
\mathbb{S} = \text{l'ensemble des évènements}
$$

Chaque fois qu'un évèment $x_i$ est observé, on incrémente son compteur $c_i$.

La probabilité d'un évènement se calcule simplement par $p(x_i) = \frac{c_i}{\sum_\mathbb{S} c_i}$.

C'est parce que nous aurons *toujours* affaire à des hypothèses discrètes que les distributions discrètes se prètent bien à nos calculs : en effet, le cerveau ne traite jamais de valeurs continues
 mais travaille en *fréquences d'évènements* et en *stimuli quantifiés* (typiquement, un neurone qui décharge son potentiel d'action).



#### Travailler avec des Distributions Discrètes





## Tâches Linguistiques

On va vouloir apprendre :

* L'orthographe = l'écriture des mots, leur accord et leurs variations en fonction de leur place dans la phrase
* La grammaire = la structure des phrases, c'est probablement la tâche la plus difficile qu'on aura à apprendre !
* La sémantique = le sens de la phrase
* La phonétique = la prononciation des mots, seuls ou en groupe, avec les liaisons nécessaires et l'élision de certains phonèmes
	* Notion de distance/complexité de passage d'un phonème à l'autre : par exemple c'est facile de passer de [a] à [e] (les orales) mais difficile de passer de [ɑ̃] à [ɛ̃] (les nasales)
		* On va volontier élider quand un mot se termine par une orale
		* On va volontiers faire des liaisons quand un mot se termine par une nasale afin de s'épargner des transitions difficiles (par facilité/paresse buccale :D)

* Les tournures de phrases, les figures de style



**Note :** Suite à une discussion sur bsky avec un type qui prétend que les language models ne consomment pas tant d'énergie que ça (https://bsky.app/profile/nafnlaus.bsky.social/post/3lehm4aex722a), j'ai été amené à me poser la question de combien coûterait mon propre modèle ?

Le type prétend qu'on arrive à d'excellents résultats avec des modèles à 8B de paramètres, ce qui amènerait le coût du moteur d'inférence à 32GB si chaque paramètre est un F32, ça reste extrêmement prohibitif mais qu'en est-il de l'algo du moteur de recherche de Google ? Lui aussi utilise des GPUs à tort et à travers, mouline l'intégralité d'internet on ne sait combien de fois par mois et sert des milliards d'utilisateurs, donc comment les LLMs (outre leur utilité/fiabilité) se comparent-ils à une requête Google ? Je prétends que ça continue de coûter des ordres de magnitude moins cher que faire une seule requête ChatGPT, vu que la query est moulinée puis exécutée une seule fois (sans compter les systèmes de cache de partout), comparé à un truc qui va s'exécuter des dizaines de fois d'affilée jusqu'à ce qu'un token <EOS> soit issu !

Bien sûr, le few-shots learning permet d'arriver à des découvertes de concepts assez rapides, mais combien de concepts doit-on apprendre et structurer pour être capable d'avoir un niveau de lecture/écriture du langage naturel au moins équivalent à ceux des LLMs actuels ? Et quelle serait la taille de telles structures ? Quelle forme/structure et quel poids vont prendre l'encodage sémantique des données que le modèle de langage va utiliser ?

On remarque que, par nécessité/pression due 1) au manque de place dans les neurones biologiques et 2) à l'architecture figée des ANN, les neurones revêtent des comportements polysémiques et encodent plusieurs informations dans un même groupe de neurones [^1], qu'on peut ensuite distinguer probablement de par l'incongruité de voir ces 2 notions ensemble dans le même contexte (orthogonalité des concepts). Les groupe de neurones utilisent alors le fait que l'information est encodée dans un espace vectoriel de grande dimension pour tirer parti du fait que les vecteurs dans ces espaces sont tous quasiment orthogonaux.
Est-ce que ce genre d'encodage / embedding est nécessaire dans notre cas, puisqu'on a toute la place nécessaire pour encoder autant de concepts que l'on souhaite ?

**TO READ:**

Scaling Monosemanticity : extracting interpretable features from Claude 3 Sonnet https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html

The Geometry of Categorical and Hierarchical Concepts in Large Language Models

https://arxiv.org/abs/2406.01506



# Notion de Certitude







==> Si c'est une notion contextuelle basée sur les voisins, ça peut peut-être même s'étendre à un groupe d'individus, ce qui permettrait d'expliquer les croyances basées sur n'importe quoi à partir du moment où suffisamment de "peers" croient une chose, on peut se baser sur eux pour étayer sa propre croyance alors que ça ne repose sur rien de concret...





[^1]: 2022, Sorscher et al, "Neural representational geometry underlies few-shot concept learning"
