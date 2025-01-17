# Approche Neuro-Symbolique

Déjà, pourquoi neuro-symbolique ? Pourquoi pas purement symbolique ?

Hé bien essentiellement parce que les réseaux de neurones profonds fonctionnent très bien pour tout ce qui implique les entrées/sorties et l'interfaçage avec l'environnement. Depuis leur conception/généralisation?/démocratisation? en 2012 avec AlexNet, ils ont continuellement démontré leur excellence dans les tâches de classification et de génération d'images, de vidéo ou d'audio. Il serait par conséquent dommage de se passer de leurs prouesses.

En revanche, il est beaucoup moins certain que les réseaux de neurones actuels soient indispensables au traitement de séquences de symboles ou de données structurées, comme le langage par exemple (même si les LLMs semblent démontrer le contraire).

De plus, le côté *boîtes noires* de tels systèmes les rend inaptes à être utilisés dans des tâches décisionnelles où l'on a besoin d'un certain degré de certitude et de démonstration de responsabilité : on ne peut pas laisser certaines décisions entre les neurones de systèmes "mentalement instables".



## Interface avec l'environnement

On va donc procéder à l'interface entre l'environnement et notre niveau symbolique grâce à des réseaux de neurones artificiels (ANN), comme illustré dans l'image ci-dessous :

![Interface with the Environment](images\NeuroSymbolic\Interface with the Environment.PNG)

On voit ici représentée la complexité des détails de l'environnement en entrée, qu'on va distiller en une représentation symbolique plus simple.

Et inversement en sortie où l'on va partir d'une description symbolique simple qu'on va étendre en une représentation détaillée, compatible avec l'environnement.



### Comment réalise-t-on cette interface entre neurones et symboles ?

Est-elle bien définie ? Est-elle même seulement possible ?

On a vu dans la [note sur les LLM](LeçonsLLM.md) et [la note sur les neurones polysémiques](PolysémieLLM.md) que tous les réseaux de neurones étudiés par Anthropic — des *image classifiers* aux modèles de langages — essayaient couche après couche, de passer à un niveau symbolique : ils assemblent des morceaux de concepts "bas niveau" et construisent des concepts de plus haut niveau pour pouvoir finalement opérer sur ces concepts.

On voit donc qu'on passe toujours d'un étage contenant de nombreux détails peu signifiants (par exemple les pixels d'une image, ou les lettres d'une phrase) vers un étage contenant peu d'éléments très signifiants (par exemple le contenu de l'image, ou la signification de la phrase).

Mais on imagine de manière assez floue ce lent passage des détails d'entrée vers les symboles de sortie. Comment décider du nombre de *layers* des réseaux ? Ou du nombre de symboles à mapper en sortie ? Quid si notre dictionnaire de symboles / concepts évolue au cours du temps ? Comment restructure-t-on alors le réseau sans tout devoir ré-apprendre, comme c'est le cas actuellement ?

C'est pourtant déjà ce qu'on fait dans les *image classifers* où l'on demande au réseau de neurones de détecter la présence d'un certain nombre de classes dans une image.

Mais ça reste malgré tout assez frustrant : dans notre expérience quotidienne, aucune image ne contient juste **un** élément. On est toujours confrontés à un ensemble d'éléments qu'on va regrouper en un tout ou bien décomposer en parties.

Par exemple si je vois ça, je vais penser à "pignon de roue de vélo" :

<img src="..\images\NeuroSymbolic\pignon.png" alt="image-20250115172548292" style="zoom:50%;" />

Mais si je vois ça, je vais penser à "vélo", quand bien même il y a aussi le "pignon de roue de vélo" dans l'image, ainsi qu'une route, une forêt, etc. :

<img src="..\images\NeuroSymbolic\vélo.jpg" style="zoom:25%;" />



### Le bon niveau de détail ?

On voit bien ici l'ambiguïté qu'il y a à se focaliser sur un niveau de détail particulier. Tout dépend de notre attention et la tâche qu'on essaie d'accomplir.

Quel est donc le "bon niveau de détail" ?

* Si on cherche à échapper à un prédateur, on se moque de la couleur de ses poils : on veut juste sa position et sa vitesse afin de trouver la stratégie optimale pour lui échapper
* Si on étudie un animal, la couleur de ses poils va nous être utile
* Si on cherche un vélo, on se moque du nombre de crans dans le pignon de la roue
* Si on veut réparer un vélo, un cran manquant dans le pignon de la roue va avoir une grande importance



## Peut-on utiliser notre algorithme d'apprentissage dans ces "*réseaux interfaces*" ?

Dans la note sur [les fondements de l'apprentissage](FondementsApprentissage.md), on a vu la caractéristique de notre algorithme d'apprentissage consiste à découvrir les corrélations entre les choses par comparaison d'exemples successifs puis de noter les changements et les points fixes afin de découvrir des groupes ou des structures communes, ainsi que détecter des fréquences d'occurrences d'évènements pour y attacher plus ou moins d'importance selon le degré de  surprise qu'ils apportent.

Cet algorithme peut-il se transposer à l'image et au son ? Pourrait-il s'appliquer dans les *deep neural nets* et remplacer la *backpropagation* ?

À ce jour, c'est difficile pour moi de répondre à cette question.

### Pour la vision ?

On a quelques indices intéressants concernant la vision sur le fait qu'on emploie des mécanismes "par comparaison" :

* Du fait de l'angle solide très réduit de la zone fovéale (3° - 5°), on n'a qu'une version quasi ponctuelle d'une image à un moment donné

* C'est donc par les saccades de l'oeil que l'on parvient à recomposer une image détaillée complète : on ne conserve en mémoire qu'un ensemble discret de *patches* détaillés (un *patch cloud*) qu'on doit mettre à jour en permanence dès qu'on perçoit un changement

* La vision périphérique est beaucoup plus sensible à la luminance qu'à la chrominance : plus on s'éloigne du centre et plus la densité de cellules RGB diminue.

* Elle est aussi beaucoup plus apte à détecter les changements et les mouvements

    * Essentiellement pour mettre à jour le *patch cloud* en commandant à notre attention visuelle de se porter dans la direction du changement

    * Mais également pour pouvoir réagir rapidement à des mouvements brusques, héritage d'une époque où l'on était encore à la merci des prédateurs

        :green_book: On remarque ici encore un mécanisme basé sur la *différence* entre 2 états ! $Delta = \left| \text{image courante} - \text{image d'avant} \right|$ 

![](images\NeuroSymbolic\png-clipart-visual-field-field-of-view-visual-perception-binocular-vision-eye-angle-angle-human-eye.png)



* La vision binoculaire offre également un moyen de faire le point sur un *plan focal*, ce qui permet d'obtenir un peu l'équivalent de l'effet *out of focus* d'une lentille d'appareil photo classique :

    <img src="..\images\NeuroSymbolic\Out of focus.png" alt="image-20250115182410488" style="zoom:50%;" />

    * Sauf que dans ce cas, on va soustraire l'image gauche de l'image droite : les zones dans le même plan focal seront très sombres tandis que les zones dans des plans focaux différents seront remplies de *patterns* colorés.

        :green_book: On remarque ici encore un mécanisme basé sur la *différence* entre 2 états ! $Delta = \left|\text{image droite} - \text{image gauche}\right|$



### Pour l'audio ?

**TODO...**

Notes : Travailler en log-space, du fait de la construction de l'appareil auditif. C'est d'ailleurs le cas quand on utilise dans le cas des [Mel spectrograms]() : le spectre audio est traité en échelle logarithmique, puis on applique une échelle psycho-acoustique appelée "Mel" (pour mélodie) pour accorder plus d'importance aux fréquences perçues par les humains (typiquement, on va accorder plus d'importance aux fréquences moyennes car typiques des voix et de la musique humaines).

!!! note "Mel scale"
     For example, we can easily tell the difference between 500 and 1000 Hz, but we will hardly be able to tell a difference between 10,000 and 10,500 Hz, even though the distance between the two pairs are the same. (from https://medium.com/analytics-vidhya/understanding-the-mel-spectrogram-fca2afa2ce53)



### Pour le langage ?

**TODO...**

Le langage écrit manipule déjà des symboles, il se prête donc tout naturellement à sa manipulation dans l'espace symbolique. La problématique n'est donc pas la même : il n'y a pas à proprement parler *d'interface* avec l'environnement dans ce cas.

Par conséquent, il est impératif de trouver un moyen d'utiliser mon algo d'apprentissage pour décomposer la structure grammaticale des phrases écrites en langage naturel et les exprimer de manière conceptuelle ! C'est hors de question qu'on se coltine les LLMs jusqu'à la fin des temps : il **faut** remplacer ces monstres in-té-gra-le-ment ! Ouste !



## Peut-on utiliser une communication bidirectionnelle avec ces "*réseaux interfaces*" ?

**TODO...**

L'idée ici est d'introduire la notion de *priming* où l'étage symbolique va "préchauffer" certains neurones de la couche inférieure afin de se préparer à la présence de tel ou tel évènement : typiquement, on va s'attendre à la présence d'un objet le long d'une trajectoire qu'on aura identifiée, ou bien la présence de certains mots dans un texte en fonction de ceux qu'on a déjà lus, ou certains phonèmes selon les mots qu'on aura déjà entendus, etc.

Mais ça implique une communication *top-down* là où les réseaux de neurones actuels ne fonctionnent qu'en *bottom-up* (si l'on omet l'étape de *backpropagation* qui propage justement l'erreur du réseau jusqu'à ses entrées !).

**TODO :** regrouper les références à des papiers qui font mention de cette communication "dans l'autre sens" dans les neurones biologiques...



## Et le raisonnement alors ?

C'est justement là où la représentation symbolique va pouvoir briller !

C'est ce qu'on verra dans une note sur les [fondements du raisonnement symbolique](RaisonnementSymbolique.md).

### Bongard Problems

On pense par exemple aux problèmes de Bongard, répertoriés par Harry Foundalis.

![](images\Reasoning\Bongard Problem.png)

Pour résoudre ces problèmes, il faut trouver la différence entre la page de gauche et la page de droite. Dans l'exemple ci-dessus (problème numéro ?), les formes de gauche sont toutes convexes tandis que celles de droite sont toutes concaves.

J'ai écrit une [note](RaisonnementBongard.md) à ce sujet.



### ARC Prize

On pense aussi au [ARC Prize](https://arcprize.org/) mis au point par François Chollet.

J'ai également écrit une [note](RaisonnementARC.md) à ce sujet.

### Comment généraliser ?

On a vu qu'il était aisé de faire résoudre des problèmes soi-disant complexes à la machine en spécifiant des algorithmes très simples. Mais comment généraliser cette capacité de raisonnement ? Comment peut-on doter la machine d'un "algorithme à trouver des algorithmes" ?

**TODO** (lol)



[^1]: Foundalis H., ["Index of Bongard problems"](https://www.foundalis.com/res/bps/bpidx.htm)
