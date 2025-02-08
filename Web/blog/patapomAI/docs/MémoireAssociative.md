# Mémoire Associative

La création de nombreuses structures conceptuelles va implicitement mener à une utilisation, et donc à des **références** des concepts entre eux.

Ces références peuvent être vues comme des liens, des connexions entre les concepts. Ces connexions ont la même signification et la même teneur que 2 neurones connectés entre eux par leur axones et leur synapses :

<img src="..\images\Concepts\Neuron.png" style="zoom:33%;" />

On va donc rapidement obtenir un **graphe conceptuel** — qu'on appelle souvent un *knowledge graph* — où les concepts vont représenter les *nœuds* du graphe, tandis que les références vont représenter les *arêtes* du graphe.

<img src="..\images\Concepts\Connectome.jpg" style="zoom:40%;" />



## Activation des neurones conceptuels

À l'instar de leurs homologues biologiques, nos "neurones conceptuels" vont pouvoir être activés et activer leurs voisins à leur tour. Mais de quelle manière ?

En effet, si un neurone active tous ses voisins, qui a leur tour activent tous leurs voisins, on va rapidement se retrouver avec une réaction en chaîne exponentielle et un réseau "épileptique" où tous les nœuds seront activés en même temps !

On notera déjà que la notion de temps est fondamentale dans les cycles d'activation des neurones biologiques : tous les neurones ne peuvent s'activer strictement "en même temps", il y a un délai de propagation minimal :

<img src="..\images\Concepts\Neuron Timing.jpg" style="zoom:60%;" />

!!! remark "Remarque"
    Il faut bien comprendre que le potentiel d'action issu du coeur du neurone (le *soma*) ne va pas se propager comme dans un fil électrique mais sauter de proche en proche, comme une onde le long d'une corde. Par conséquent, la longueur de l'axone et d'autre facteurs qu'on va voir ci-dessous vont déterminer la vitesse de propagation de ce potentiel d'action.



### Neurones biologiques

Le neurone biologique va pouvoir jouer sur plusieurs facteurs pour intégrer les stimuli et les propager à ses voisins :

* **Le temps de la période réfractaire**
    * C'est le temps pendant lequel un 2nd potentiel d'action ne peut se produire
    * À noter qu'il y a 2 type de périodes réfractaires :
        * Absolue : aucun pic d'action, quelle que soit la force du stimulus
        * Relative : un pic d'action peut se produire, à condition d'un stimulus bien plus fort que le seuil normal
    * C'est la raison principale pour laquelle on n'est pas en crise épileptique permanente !
    * C'est un mécanisme assez rigide qui n'a pas l'air d'être pilotable au niveau cellulaire individuel
    * :white_check_mark: C'est probablement quelque chose dont on va vouloir s'inspirer dans notre implémentation !
* **Le seuil d'activation**
    * C'est la quantité de charges nécessaire pour déclencher le pic de potentiel d'action
    * C'est un mécanisme assez souple qui est facilement pilotable au niveau cellulaire individuel et qui confère une grande plasticité au cerveau
    * :white_check_mark: C'est aussi quelque chose qu'on va vouloir émuler dans notre graphe
* **Une mécanique interne d'intégration des stimuli**
    * Les neurones ne sont pas simplement des détecteurs de dépassement de seuils mais peuvent comporter un mécanisme interne bien plus complexe[^1] pour déterminer s'il doivent s'activer ou non
    * :no_entry: On va s'arrêter à une notion binaire d'activation pour nos concepts, on ne veut pas pousser le mimétisme trop loin et en faire de véritables petits processeurs
* **La longueur de la connexion aux voisins via l'axone et la vitesse de propagation aux voisins**
    * Cela va dépendre du taux de myélinisation de l'axone (une sorte de gangue qui entoure plus ou moins l'axone et lui permet de réguler la vitesse de transmission des potentiels d'action)
        * Un axone fortement myélinisé de 10µm de diamètre va conduire le potentiel d'action à 100m/s et provoquera des pics d'activation de 0.5ms
        * Un axone moyennement myélinisé de 5µm de diamètre va conduire le potentiel d'action à 10m/s et provoquera des pics d'activation de 1ms
        * Un axone faiblement myélinisé < 1µm de diamètre va conduire le potentiel d'action à 1m/s et provoquera des pics d'activation de 2ms
    * En gros, la myélinisation consiste à faire "sauter" les potentiels d'action de proche en proche et ainsi accélérer leur propagation
    * C'est un mécanisme assez souple qui est facilement pilotable au niveau cellulaire individuel et qui confère une grande plasticité au cerveau
    * :no_entry: Je peux sans doute me tromper mais pour l'instant on va ignorer cette propriété qui joue sur la vitesse de transmission des stimuli
* **La connexion elle-même**
    * Les neurones vont "choisir" vers quels autres neurones se connecter en guidant leurs appendices qui vont chercher une cible ([vidéo](https://www.youtube.com/watch?v=Rvmvt7gscIM&ab_channel=DrLilaLandowski))
        * On suppose que la recherche de la "cible" est probablement guidée par un suivi de gradient chimique ?
    * C'est un mécanisme relativement souple qui s'étalent sur une échelle de temps de plusieurs dizaines d'heures
    * :ok: Ici on va évidemment modifier notre graphe régulièrement et donc bien entendu qu'on s'inspirera de ce mécanisme...



### Neurones conceptuels

Comme pour les autres sujets (approche neuro-symbolique et apprentissage), on ne va pas reproduire les mécanismes chimiques microscopiques qui se passent dans le cerveau mais on va rester au niveau macroscopique :

* On va propager les activations par vagues et lever des *flags* dans chaque concept pour empêcher plusieurs pics
    * Comme la vague d'activation se propage de manière exponentielle, il est aisé de calculer le nombre de vagues de propagation nécessaires pour couvrir tout le graphe : $N_{vagues} \approx log( nodes ) / log( \hat{N}_{edges} )$ où $\hat{N}_{edges} = edges / nodes$ donne le nombre moyen d'arêtes par nœud du graphe
    * En pratique, on va utiliser un *timestamp* indiquant le numéro de *round* d'activation plutôt qu'un *flag*. Ce *timestamp* sera incrémenté à la fin du round, quand on aura fini de propager $N_{vagues}$ d'activation. Un nœud qui aura déjà été visité par une vague du même *round* ne pourra plus être activé à nouveau (période réfractaire)
    
* On va probablement vouloir propager des activations en *floats* pour pouvoir émuler le fait que les noeuds n'ont pas tous la même "puissance de stimulation"
    * En effet, un nœud central qui possède beaucoup de références aura de fortes chances d'être activé souvent, on voudra donc probablement pondérer ses activations par $1/N_{références}$
        * On pense par exemple au cas d'une structure hiérarchique où la direction ***enfant → parent*** doit avoir moins de poids que la direction ***parent → enfant***, sinon on va se retrouver très rapidement à activer l'intégralité du graphe...
    
* :warning: Contrairement aux réseaux de neurones artificiels classiques, on ne vas **pas** faire varier le poids des connexions du graphe
    * On pourrait en effet imaginer qu'on pourrait simuler le seuil d'activation ou la myélinisation des connexions à l'aide de poids variables qu'on va pouvoir apprendre au fur-et-à-mesure de l'utilisation du graphe
        * Mais comme le graphe va être amené à évoluer en permanence, ça impliquerait de devoir revoir l'évaluation des poids du graphe à chaque instant
    * Je préfère que les poids d'activation soient fixes et qu'on travaille à partir des *valeurs d'activations relatives* d'un concept par rapport à un autre
        * Typiquement si l'on active un concept avec une valeur de $10$ et qu'on propage cette activation avec un facteur d'atténuation de 50% alors son voisin aura une valeur de $10/2$ , le suivant une valeur de $10/4$, etc.
            * On pourra donc calculer l'importance d'un concept en la rapportant à la valeur maximale de $10$ : le voisin aura donc une importance de 50%, le suivant 25%, etc.
        * C'est à la charge de l'algorithme de [raisonnement](RaisonnementSymbolique.md) d'accorder de l'importance aux concepts en fonction de leur valeur d'activation relative



## Fonctionnement de la mémoire associative

Une fois les détails techniques d'activation du graphe réglés, on peut enfin se pencher sur le fonctionnement de cette mémoire associative.

Cette mémoire va nous permettre de réaliser facilement un mécanisme d'attention en activant des concepts particuliers qui, en retour, activeront les concepts connexes.

J'aime me représenter ce mécanisme comme un paysage de haute dimension dans lequel on va isoler un *domaine* (en jaune, ci-dessous) où les activations des 3 concepts illustrés seront maximales :

![](images\Concepts\Associative Memory Highlighting.jpg)



!!! warning ""
    Ici il ne faut pas confondre l'algorithme de propagation de vagues d'activation avec celui de *gradient descent* : même si les activations seront maximales au niveau des concepts "source" (c-à-d les mots-clés de notre recherche), on ne cherche pas à suivre un gradient d'activation !



En réalité, le *manifold* sur lequel l'algorithme va fonctionner n'a rien d'un paysage et on va simplement faire monter les poids d'activation de chaque concept en fonction de ses connexions. Ces poids représenteront ensuite le niveau d'attention qu'on doit porter aux autres concepts et serviront donc d'entrée à des algorithmes de [raisonnement](RaisonnementSymbolique.md) qui pourront ensuite prendre des décisions sur le déroulement de leurs procédures et les décisions à prendre.



### Exemple de la désambiguïsation sémantique

Prenons un exemple très important : celui de résoudre l'ambiguïté d'un mot dans une phrase.

#### De multiples sens

Prenons le mot "*nucléaire*", on trouve 3 définitions dans le [dictionnaire Usito](https://usito.usherbrooke.ca/d%C3%A9finitions/nucl%C3%A9aire) :

1. Relatif au noyau de la cellule. (biologie)
2. Relatif au noyau de l'atome. (physique)
3. Famille *nucléaire*. (sociologie)

On [se rappelle](ReprésentationSymbolique.md#un-concept-est-unique) qu'un concept correspond grosso modo à une définition du dictionnaire. Donc si on lit le mot "*nucléaire*" dans un texte, il est important de savoir à quelle définition on fait référence.

#### Activation des mots du texte

1. Si l'on active chacune des 3 définitions dans le graphe, on va également activer dans une moindre mesure tous les termes connexes dans les 3 domaines listés : biologie, physique et sociologie.
2. Imaginons que dans le même texte on rencontre par la suite le mot "*centrale*", il est alors probable que les termes connexes dans le domaine de la physique prennent encore un peu plus d'importance puisque les mots "*centrale*" et "*nucléaire*" sont souvent proches l'un de l'autre.
3. Finalement, si on rencontre le mot "*combustible*" alors on va commencer à avoir de sérieux indices qu'il s'agit là d'un texte sur l'énergie nucléaire.

Il est probable qu'on arrive ainsi très vite à déterminer la définition correcte du mot "*nucléaire*" à employer.

De même que la désambiguïsation du mot nucléaire servira à son tour pour qualifier correctement les définitions d'autres mots ambigus.



!!! remark "Remarque"
     Ça ressemble aux modèles [*bag-of-words*]() et [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) mais en beaucoup moins naïf puisqu'on ne fait pas que compter des occurrences de mots de manière indéterminée et désordonnée.<br>On construit nos ***éléments de preuve*** au fur-et-à-mesure qu'on lit le texte, les activations jouent également un rôle dans la compréhension et la construction de la structure grammaticale de la phrase.



#### Le choix des mots

Doit-on activer tous les mots de la même manière ? Il est évident que certains mots sont plus porteurs de sens que d'autres.

Au fur-et-à-mesure qu'on va apprendre les mots du vocabulaire de la langue française, on va pouvoir également dresser un bilan de leur **fréquence d'apparition** dans les textes qui sera indicative de l'importance qu'on doit leur accorder.

On retrouve encore une fois cette notion de *self-information* ou de *surprise* dont on a déjà parlé dans [l'algorithme d'apprentissage](FondementsApprentissage.md#ponderer-leffet-des-exemples) :

$$s(x)=log\left(\frac{1}{p(x)}\right)$$

Où $p(x)$ est la probabilité d'occurrence de l'événement $x$.

Dans ce cas, on pose :

$$p(x)= \frac{ \left| \{w \in W | w = x \} \right| }{ \left| W \right| }$$

Où $W$ représente l'ensemble des mots qu'on a lus — pas seulement dans ce texte-ci mais depuis qu'on a commencé à apprendre à lire.

!!! example "Exemple"
     Dans la langue française, sur 700,000 mots étudiés on relève 26,541 occurrences du verbe "*être*", ce qui impliquerait que $p(\text{"être"})=0.038$ et la surprise serait de $s(\text{"être"})=4.72$.<br><br>Tandis que le mot nucléaire apparaîtrait environ 426 fois sur un total de 12,561,968 mots étudiés, ce qui impliquerait que $p(\text{"nucléaire"}) = 0.000034$ et la surprise serait de $s(\text{"nucléaire"}) = 14.8$ soit environ 3 fois plus importante que "*être*" !



On voit donc qu'un mot peu fréquent portera plus de sens et se verra accordé plus d'importance qu'un mot utilisé fréquemment.



## Multi-Head Attention

Les LLMs possèdent plusieurs "*têtes d'attention*" (*attention heads*) par *layer* de *transformer* (cf. cette [note](PolysémieLLM.md#features-observees) sur les LLMs). Chaque tête d'attention sera chargée de différentes tâches :

* Des tâches de bas-niveau dans les premières couches, comme : détecter des sommes d'argent, des morceaux de code, des titres honorifiques, des séquences d'ADN, des caractères hébreux, cyrilliques ou arabes, etc.
* Des tâches de niveau intermédiaire dans les couches suivantes, comme détecter des attributs grammaticaux et les regrouper pour décorer les mots centraux de la phrases (c-à-d ceux qui portent le plus de sens)
* Des tâches de haut-niveau dans les couches finales (juste avant la re-tokenization) qui vont effectuer les combinaisons de l'équivalent de nos concepts dans le but de simuler un semblant de "raisonnement" (le fait que les LLMs sont doués de raisonnement fait encore débat au moment où j'écris)

Chaque tête d'attention va donc travailler dans son propre contexte et former son propre *vecteur d'attention* qui sera ensuite combiné avec celui des autres têtes via un *multilayer perceptron* (MLP) avant d'être finalement envoyé au *layer* suivant.

Sur le même modèle, on va probablement vouloir lancer les activations de notre mémoire sémantique **dans leurs propres contextes**, chaque contexte d'activation servant à effectuer une tâche particulière, comme la désambiguïsation de différents mots, la recherche de synonymes, la recherche associative itérative (ou chaque résultat retourné sera raffiné à chaque fois avec un nouveau critère de recherche), etc.





## Plausibilité biologique

On sait que les neurones sont facilement excitables par des impulsions ou des patterns de fréquences particuliers [^2][^3], il est donc aisé pour le cerveau de créer des hiérarchies de neurones activés par la présence ou l'absence de certain attributs / features.

Il est tout à fait envisageable que le cerveau encode un ensemble de concepts définis de manière plus ou moins floue dans les différentes zones qui réalisent la mémoire à long terme (mémoires épisodique, sémantique et procédurale) et la mémoire à court terme (mémoire de travail). Ces concepts pourront ensuite être stimulés pour éveiller tout un réseau de concepts connexes qui pourront orienter notre pensée dans des directions intéressantes.

On s'aperçoit que, là aussi, c'est à la charge d'un mystérieux "étage supérieur" de piloter les stimulations et de guider la recherche en suivant une piste privilégiée.

De nombreuses questions demeurent, notamment celles sur la façon dont on pilote une activation mémorielle : "comment lance-t-on une recherche ?" "Peut-on conserver le résultat de la recherche ou est-ce qu'il se combine forcément avec la *query* ?", "Peut-on réinialiser la recherche et comment ?", etc.



??? note "Stuff"
    Parler de JollyFiche ?<br>
    Backpropagation : https://en.wikipedia.org/wiki/Neural_backpropagation<br>
    "On average, a backpropagating spike loses about half its voltage after traveling nearly 500 micrometres."<br>
    Site bien foutu pour les symboles unicode : https://symbl.cc/



[^1]:  2021, Beniaguev et al., ["Single cortical neurons as deep artificial neural networks"](https://www.sciencedirect.com/science/article/pii/S0896627321005018)
[^2]: 2024, Kirsanov A., ["How your brain chooses to remember"](https://www.youtube.com/watch?v=ceFFEmkxTLg&ab_channel=ArtemKirsanov)
[^3]: 2024, Yang W. et al. ["Selection of experience for memory by hippocampal sharp wave ripples"](https://www.science.org/doi/10.1126/science.adk8261) ([site](https://winnieyangwannan.github.io/RippleTagging/projects/1_project/)) ([notebook](https://colab.research.google.com/drive/1qwruNxqS20xIl7sXYwjUA5zXKLTMWuTz?usp=drive_link))

[^102]: 2016 https://www.researchgate.net/publication/292978016_Somato-dendritic_Synaptic_Plasticity_and_Error-backpropagation_in_Active_Dendrites
