# Neurones Polysémiques



Discussion sur la polysémie des neurones probablement due à l'architecture figée et la contrainte de place (comme pour les neurones biologiques) => besoin de compresser les données, ça donne aussi une pression naturelle pour la simplification/agglomération de concepts [^1][^2]

D'après un papier sur la *sparse optimization* [^5], on peut encoder $\mathcal{O}(n {\rm e}^{n/k})$ *features* dans un vecteur de dimension $n$ de manière non destructive à condition que le vecteur soit *sparse*, c-à-d que le nombre de composantes non nulles soit $k \ll n$ (cf. https://gabgoh.github.io/ThoughtVectors/).



## Superposition vs. Composition

L’étude présentée dans [^3] propose une analyse particulièrement intéressante de la distinction entre la *superposition* et la *composition* des caractéristiques (*features*) qu'on cherche à représenter.

![Composition vs Superposition](images\LLM\Composition vs Superposition.png)



Elle met en évidence une gradation entre deux approches principales : d'une part, l’attribution d’une unité (*unit*) par *feature*, qui implique un coût mémoire élevé mais permet la combinaison flexible des caractéristiques ; d'autre part, l’attribution d’une unité par *combinaison de features*, qui réduit significativement le poids mémoire et augmente le nombre de *features* représentables ($2^{unités}$) mais interdit toute possibilité de combinaisons ultérieures

![GradationInSuperpositionAndComposition](images\LLM\GradationInSuperpositionAndComposition.png)

<u>Cas #1 :</u>

<img src="..\images\LLM\Thorpe Local Code.png" alt="Thorpe Local Code" style="zoom:50%;" />

<u>Cas #2 :</u>

<img src="..\images\LLM\Thorpe Semi-Local Code.png" alt="Thorpe Semi-Local Code" style="zoom:50%;" />

<u>Cas #3 :</u>

<img src="..\images\LLM\Thorpe Semi-Distributed Code.png" alt="Thorpe Semi-Distributed Code" style="zoom:50%;" />

<u>Cas #4 :</u>

<img src="..\images\LLM\Thorpe Highly-Distributed Code.png" alt="Thorpe Highly-Distributed Code" style="zoom:50%;" />



Il semblerait que ça soit justement un mélange de composition et de superposition qu'on observe dans les neurones artificiels *et* naturels :

![Mixing Composition and Superposition](images\LLM\Mixing Composition and Superposition.png)

Ce qui correspondrait à un code semi-distribué, comme dans le cas numéro 3 listé plus haut :

![Superposition](.\images\LLM\Superposition.png)



## Monosémie dans un *Transformer* simple couche.

Le papier [^1] fait une analyse super intéressante de la signification des *features* qu'ils ont extraites de leur réseau de neurones de test : un *transformer* à une seule couche possédant plusieurs *attention heads (h0, h1, ...)* et un *Multi Layers Perceptron (MLP)* en sortie.

Ce modèle est un échantillon représentatif des centaines de couches semblables qui composent un modèle comme GPT3.

![Polysemanticity - Single Layer MLP](images\LLM\Polysemanticity - Single Layer MLP.png)



Ils se sont placés juste après l'étage du MLP et ont utilisé un *sparse auto-encoder* pour extraire des *features* (des *sparse vectors*) représentées par des combinaisons linéaires d'activations des neurones de l'étage de sortie du MLP. C'est grosso modo un problème de [*compressed sensing*](https://en.wikipedia.org/wiki/Compressed_sensing).

Voici un lien vers leur outil de visualisation : https://transformer-circuits.pub/2023/monosemantic-features/vis/a1.html

Ils ont pu observer des *features* qui s'activent sur :

* Du roumain, du finlandais, du chinois, etc.
* Des séquences ADN en minuscules (ex: gtcaactta) ou en majuscules (ce sont 2 *features* différentes !)
* Des morceaux de code C++, ASM, SQL, etc. ou des regexp
* De longues séquences de chiffres décimaux, hexadécimaux ou même du code Base64
* Des caractères en arabe, cyrillique, hébreu, etc.
* "*Mid-word tokens, esp. in medieval/fantasy contexts*" :sweat_smile:
* (et des dizaines de milliers d'autres du même accabit...) 



### Taille de l'*auto-encoder*

Ils ont entraîné divers modèles avec un rapport de dimensions de l'*auto-encoder* / nombre de neurones du MLP allant de $\times 1$  (512 dimensions, pour le modèle A0) à $\times 256$ (131,072 dimensions, pour le modèle A5).

!!! quote "à propos de la superposition des neurones, plutôt que de la superposition"
    Crucially, we decompose into *more features than there are neurons*. This is because we believe that the MLP layer likely uses **superposition** to represent more features than it has neurons (and correspondingly do more useful non-linear work!). In fact, in our largest experiments we'll expand to have 256 times more features (131,072) than neurons, although we'll primarily focus on a more modest 8× expansion (4096 features).

!!! quote
    **Just 512 neurons can represent tens of thousands of features.** Despite the MLP layer being very small, we continue to find new features as we scale the sparse autoencoder.



Ils ont ainsi pu remarquer que les neurones individuels de leurs modèles s'activaient sur de nombreux tokens dans des contextes relativement ambigus (*polysémie*) :

!!! quote
    In a small language model we discuss in [^1], [a single neuron](https://transformer-circuits.pub/2023/monosemantic-features/vis/a-neurons.html?ordering=index#feature-83) responds to a mixture of academic citations, English dialogue, HTTP requests, and Korean text. Polysemanticity makes it difficult to reason about the behavior of the network in terms of the activity of individual neurons.



Tandis que les *features* extraites par leurs modèles s'activaient de manière non-ambiguë dans des contextes spécifiques (*monosémie*).



!!! tip "Élément important du papier"
    Les *neurones* sont polysémiques mais les *features* (c-à-d les combinaisons linéaires de neurones) sont monosémiques.<br>On se rappelle par exemple du neurone qui encodait des oreilles de chat et le pare-choc avant des voitures, dans VGG16 : il est vraisemblable que ce neurone ambigu intervenait comme composante d'une *feature* qui était, elle, non ambiguë.



### Cas étudiés

Pour leur étude, ils se sont focalisés sur le comportement de 4 *features* particulières : les caractères arabes, hébreux, des séquences d'ADN et le code Base64.

Pour chaque cas, ils ont vérifié :

* la *sensibilité* et la *spécificité* de la feature 
    * La sensibilité mesure le fait que quand le contexte est présent, la *feature* doit être activée
    * La spécificité mesure le fait que quand la *feature* est activée, le contexte doit être présent
* que la feature correspond bien à une activation des neurones du modèle dans n'importe quel contexte, et non pas uniquement sur une portion des données d'entraînement
    * Pour ce faire, il suffirait simple de fournir des exemples hors *training set* de contextes où la *feature* devrait s'activer, [mais ils utilisent une méthode beaucoup plus rigoureuse mathématiquement](https://transformer-circuits.pub/2023/monosemantic-features/index.html#feature-arabic-effect)
    * Ils pratiquent aussi "l'ablation" de la *feature* sur le modèle afin d'observer l'effet de la *feature* sur les données (est-ce que la *feature* aidait à détecter une caractéristique particulière ou non ?)
    * Et pour finir, ils poussent l'activation de la *feature* à son niveau maximal afin de voir l'effet sur le texte généré (il est aisé de vérifier que les caractères de sortie du modèle sont des caractères arabes si on pousse la *feature* "caractères arabes" à son maximum)
* que la *feature* ne correspond pas juste à un seul neurone
    * Effectivement, à chaque fois la feature correspond à une activation d'un ensemble non trivial de neurones
* que la *feature* est "[universelle](https://transformer-circuits.pub/2023/monosemantic-features/index.html#feature-arabic-universality)"
    * C'est-à-dire qu'elle existe dans d'autres modèles entraînés sur le même *dataset* mais avec une *random seed* différente
    * Ils vérifient également l'universalité sur toutes les autres *features* en utilisant des méthodes automatisées dans un [autre chapitre](https://transformer-circuits.pub/2023/monosemantic-features/index.html#phenomenology-universality)



### Représentativité des *features*

Ils ont pu vérifier que dans la version à 4096 *features*, les *features* couvraient 79% de la mesure d'objectif du modèle et donc représentaient une portion très significative de l'activité neuronale.

Ils se posent également la question de savoir si ces *features* sont représentatives du modèle ou bien des données d'entraînement ?

Ils étudient ensuite ce qu'ils ont appelé *feature splitting* qui sont des vecteurs d'activation très proches et donc très semblables dans leur signification, mais qui servent à déterminer des contextes différents.
Ils ont remarqué que plus ils allouaient de dimensions pour les *features*, plus celles-ci se raffinaient (on rappelle que dans leur notation, le modèle A0 a autant de dimensions/*features* que les neurones de sortie du MLP, càd 512, tandis que le modèle A1 possède 4096 dimensions, A2 16384 dimensions, etc.).

![Features Splitting](images\LLM\Features Splitting.png)

!!! quote "Sur la spécialisation des *features*"
    The general `the` in mathematical prose feature ([A/0/341](https://transformer-circuits.pub/2023/monosemantic-features/vis/a0.html#feature-341)) has highly generic mathematical tokens for its top positive logits (e.g. supporting `the denominator`, `the remainder`, `the theorem`), whereas the more finely split machine learning version ([A/2/15021](https://transformer-circuits.pub/2023/monosemantic-features/vis/a2.html#feature-15021)) has much more specific topical predictions (e.g. `the dataset`, `the classifier`).



### ["Finite State Automata"](https://transformer-circuits.pub/2023/monosemantic-features/index.html#phenomenology-fsa)

!!! quote
    **Features connect in "finite-state automata"-like systems that implement complex behaviors.** For example, we find features that work together to generate valid HTML. (See ["Finite State Automata"](https://transformer-circuits.pub/2023/monosemantic-features/index.html#phenomenology-fsa).)



## Extension à un LLM complet

Dans la suite de leurs travaux [^2], l'équipe d'Anthropic est parvenue à mettre en évidence le même phénomène de *features* monosémiques mais à l'échelle d'un LLM complet cette fois-ci !

!!! quote
    We chose to focus on the middle layer of the model because we reasoned that it is likely to contain interesting, abstract features ← ça tendrait à confirmer mon hypothèse d'une structure symétrique où les concepts de haut-niveau sont au milieu de l'architecture !

Comme dans [^1], ils ont isolé 4 *features* particulières qui réagissent : au "Golden Gate bridge", aux "moyens de transport", aux "sciences du cerveau" et aux "attractions touristiques populaires".

Ils ont réalisé les mêmes tests, dans la mesure du possible, pour s'assurer que les *features* étaient bien spécifiques à un contexte particulier, ne dépendaient pas d'un seul neurone, etc.

!!! note "Différence avec les *features* de bas niveau"
    Dans le cas de la *feature* "Golden Gate bridge", l'équipe montre qu'elle s'active dans toutes les langues (!!) et par conséquent confirme le haut niveau d'abstraction de la *feature* qui tranche nettement avec les *features* de bas niveau de [^1] qui ne réagissaient qu'au niveau du token.



### Mémorisation vs. Généralisation

https://transformer-circuits.pub/2023/july-update/index.html#finite-data

Quand il y a peu de données, la superposition permet la mémorisation exacte. Mais quand il y a trop de données, la superposition commence à clusteriser les points communs entre les données : il y a une sorte de changement de phase qui se produit.



!!! question
     Est-il plausible d'imaginer que la superposition sert également à rendre la mémorisation plus robuste ?<br><br>En effet, si les *features* sont réellement des vecteurs résultant de combinaisons linéaires d'activations neuronales, il est assez vraisemblable que la perte d'un nombre (même significatif) de neurones (combien ?) n'entraîne pas tellement de perturbations de la direction générale du vecteur, et par conséquent la *feature* devrait toujours être correctement reconnue.



On sent que le bottleneck est important à la fois pour stocker plus de data dans une place réduite ou limitée mais c'est également ce qui force le réseau à généraliser / synthétiser → indispensable d'ajouter cette contrainte pour éviter l'explosion du nombre de concepts ?





## Conclusion



Enseignement final : même si c´est la merde au niveau interprétabilité au niveau neuronal, le réseau VEUT FAIRE DU SENS et on parvient à démêler des features non ambiguës quand on combine linéairement les activations des neurones entre elles.
Par conséquent il n´est pas nécessaire de s'emmerder la vie en 12000 dimensions : si le cerveau pouvait opérer au niveau symbolique, il le ferait !



# TODO

Utiliser mon algo d'apprentissage pour retrouver la signification des *features* isolées par l'*auto-encoder* de [^4] ?

 → Si on liste tous les concepts associés aux mots/phrases sur lesquels la *feature* est activée, on peut peut-être trouver les points communs ?

 → Ca fait un peu "serpent qui se mord la queue" dans la mesure où les concepts associés à ces phrase/mots sont justement les trucs qu'on veut arriver à déterminer... :sweat:

 → Apparemment ils ont fait un truc automatisé en demandant à Claude (un LLM) de faire une généralisation à partir des tokens sur lesquels la *feature* s'est activée.



[^1]: Anthropic AI, ["Towards Monosemanticity: Decomposing Language Models With Dictionary Learning"](https://transformer-circuits.pub/2023/monosemantic-features/index.html)
[^2]:  Anthropic AI, ["Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet"](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html)
[^3]: Anthropic AI, ["Distributed Representations: Composition & Superposition"](https://transformer-circuits.pub/2023/superposition-composition/index.html)
[^4]:  Gershman S. J. et al., ["Key Value Memory in the Brain"](https://arxiv.org/abs/2501.02950)
[^5]: Wotao Yin, ["Sparse Recovery Guarantees"](https://ise.ncsu.edu/wp-content/uploads/sites/9/2020/08/SparseRecoveryGuarantees.pdf)