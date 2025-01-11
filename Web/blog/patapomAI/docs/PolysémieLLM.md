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

### *Features* observées

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

Malgré la promesse de ce chapitre de faire mention d'un début de *procédure*, je n'ai pas trouvé leur argumentation très intéressante...

!!! quote
    **Features connect in "finite-state automata"-like systems that implement complex behaviors.** For example, we find features that work together to generate valid HTML. (See ["Finite State Automata"](https://transformer-circuits.pub/2023/monosemantic-features/index.html#phenomenology-fsa).)



## Extension à un LLM complet

Dans la suite de leurs travaux [^2], l'équipe d'Anthropic est parvenue à mettre en évidence le même phénomène de *features* monosémiques mais à l'échelle d'un LLM complet cette fois-ci ! Ils ont utilisé le modèle [Claude 3 Sonnet](https://www.anthropic.com/claude/sonnet) de chez Anthropic.

!!! quote
    We chose to focus on the middle layer of the model because we reasoned that it is likely to contain interesting, abstract features ← ça tendrait à confirmer mon hypothèse d'une structure symétrique où les concepts de haut-niveau sont au milieu de l'architecture !

Leur outil de visualisation est, comme toujours, disponible en ligne : https://transformer-circuits.pub/2024/scaling-monosemanticity/umap.html?targetId=34m_31164353



#### Vérification de la pertinence des *features*

Comme dans [^1], ils ont isolé 4 *features* particulières qui réagissent : au "Golden Gate bridge", aux "moyens de transport", aux "sciences du cerveau" et aux "attractions touristiques populaires".

Ils ont réalisé les mêmes tests – dans la mesure du possible, par exemple ils n'ont pas pu mesurer la *sensibilité* – pour s'assurer que les *features* étaient bien spécifiques à un contexte particulier, ne dépendaient pas d'un seul neurone, etc.

!!! note "Différence avec les *features* de bas niveau"
    Dans le cas de la *feature* "Golden Gate bridge", l'équipe montre qu'elle s'active dans toutes les langues (!!) et par conséquent confirme le haut niveau d'abstraction de la *feature* qui tranche nettement celles de bas niveau qui ne réagissaient qu'au niveau du token dans [^1].



#### Mise en évidence

Pour mettre en évidence l'influence des *features* sur le comportement du modèle, ils ont pratiqué ce qu'ils appellent du *feature steering* et qui consiste simplement à clamper l'activation de la *feature* à son maximum.<br>
Cette pratique permet de modifier le comportement, les préférences, les buts et les biais du modèle; de le pousser à commettre des erreurs; et même à circonvenir certaines barrières de sécurité mise en place par les concepteurs !

Dans l'exemple ci-dessous, en bloquant la *feature* Golden Gate bridge à $10 \times$ son maximum, le modèle va même jusqu'à prétendre qu'il **est** le Golden Gate bridge ! :laughing:

![Feature Sterring Golden Gate bridge](images\LLM\Feature Sterring Golden Gate bridge.PNG)

#### *Features Splitting*

Ils ont remarqué là aussi des cas de *features splitting* où des *features* sémantiquement semblables vont se regrouper en îlots de vecteurs de direction assez proche. Par exemple, la *feature* Golden Gate bridge sera assez voisine d'autres *features* qui traitent de San Francisco et de sa région.

!!! quote ""
    Overall, it appears that distance in decoder space maps roughly onto relatedness in concept space, often in interesting and unexpected ways.



#### [Représentativité des concepts](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html#feature-survey-completeness)

Ils ont mis en évidence l'équivalent d'une loi de Zipf dans la représentation des concepts qui montre une dépendance entre l'encodage d'un concept et sa fréquence de représentation dans les données d'entraînement.

<img src="..\images\LLM\Feature Presence vs Frequency in Training Data.png" alt="Feature Presence vs Frequency in Training Data" style="zoom:40%;" />

Ça impliquerait que si l'on souhaite qu'un concept présent seulement une fois par milliard de tokens apparaisse comme *feature* unique, alors il faudrait l'équivalent d'un milliard de *features* (valides, car certaines sont invalides/*dead*) dans le dictionnaire de l'auto-encoder.

On notera qu'il n'est pas forcément nécessaire d'avoir une *feature* unique par concept puisqu'il est généralement faisable de représenter un concept par composition de plusieurs *features*. Par exemple, pas besoin d'une *feature* "New York City" si on a une *feature* "Grande Ville" et une *feature* "état de New York".



#### Features Intéressantes

Au-delà des *features* de personnages célèbres et d'éléments de code, on notera l'existence de *features* liées à la *position des éléments dans une liste* :

<img src="..\images\LLM\List Position Features.png" alt="List Position Features" style="zoom:50%;" />

!!! warning "Remarque"
    On notera que les *features* ne s'activent pas sur la première ligne, probablement parce que le modèle n'a encore pas "compris" qu'il s'agissait d'un ensemble de listes avant d'arriver à la 2ème ligne.<br><br>On voit là encore une limitation des LLMs qui semblent incapables de "réviser un jugement" et de repartir en arrière de par la nature-même du traitement séquentiel des tokens. Là où un humain reviendrait évidemment réviser son jugement sur la première liste et la taggerait de manière adéquate...



#### [Raisonnement](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html#computational)

Ils ont tenté de vérifier si les *features* découvertes faisaient partie d'une chaîne de raisonnement quand on posait des questions compliquées qui demandaient plusieurs étapes de "réflexion".

Hormis quelques exemples flagrants, le fait qu'ils interviennent seulement à un étage particulier du modèle (probablement exactement au milieu) les empêche probablement de discerner d'autres *features* identiques à d'autres étages pour des raisonnements différents.

!!! remark
    C'est à se demander combien il y a de redondance de ces *features* et dans combien d'étages ? Puisque finalement on ne peut pas compter sur une sorte de **synchronicité** miraculeuse pour que tous les éléments importants d'un "raisonnement" se produisent toujours au même endroit dans le pipeline. Et comme il ne peut pas y avoir de ré-entrance dans le pipeline — à moins d'en ressortir complètement pour y ré-entrer à nouveau, ce que je soupçonne être la base du *Chain of Thought reasoning* — ça veut dire qu'il doit y avoir de nombreux étages qui prennent part au *raisonnement* et qui ont donc besoin de reproduire toujours les <u>mêmes concepts</u> afin de pouvoir les exploiter à n'importe quelle étape de n'importe quel *raisonnement*... Quel immense gâchis si c'est le cas ! :scream:



### Mémorisation vs. Généralisation

Dans un article de blog intéressant [^6], l'équipe d'Anthropic s'intéresse à la différence entre les modèles qui ne font que mémoriser les données et ceux qui pratiquent la généralisation.

Quand il y a peu de données, la superposition permet la mémorisation exacte. Mais quand il y a trop de données, la superposition commence à clusteriser les points communs entre les données : il y a une sorte de changement de phase qui se produit.

<img src="..\images\LLM\Memorization vs Generalization.png" alt="Memorization vs Generalization" style="zoom: 50%;" />

!!! question
     Est-il plausible d'imaginer que la superposition sert également à rendre la mémorisation plus robuste ?<br><br>En effet, si les *features* sont réellement des vecteurs résultant de combinaisons linéaires d'activations neuronales, il est assez vraisemblable que la perte d'un nombre (même significatif) de neurones (combien ?) n'entraîne pas tellement de perturbations de la direction générale du vecteur, et par conséquent la *feature* devrait toujours être correctement reconnue.



!!! example "Hypothèse"
    On sent que la contrainte d'un nombre de neurones réduit est importante à la fois pour pouvoir compresser plus de data dans une place réduite ou limitée mais c'est également ce qui force le réseau à généraliser / synthétiser → est-il indispensable d'ajouter cette contrainte pour éviter l'explosion du nombre de concepts ?





## Discussion

On se rend compte que même si l'interprétation au niveau purement neuronal est difficile voire impossible à cause de la polysémie des neurones individuels, il existe une transformation (non-)linéaire vers un espace vectoriel sur-déterminé qui laisse apparaître des vecteurs (*features*) monosémiques non-ambigus : le réseau "veut faire du sens" !

Un avantage d'avoir encodé et groupé les *features* sémantiquement dans cet espace vectoriel de haute dimension est que cela permet de retrouver un "champ lexical" à moindre coût en faisant des opérations sur les vecteurs. Par exemple, on peut imaginer retrouver tous les concepts voisins en calculant la *cosine similarity* avec un seuil plus ou moins élevé selon la sélectivité du voisinage qu'on cherche...<br>
On doit aussi pouvoir faire ces fameuses opérations entre vecteurs "king - man + woman = queen" → à noter que j'ai à peu près l'équivalent dans mon logiciel quand j'active plusieurs concepts, je ne suis pas non plus certain que ça soit quelque chose qu'on ne puisse pas émuler de manière purement symbolique.



Par conséquent, au-delà de l'étonnement que cet encodage peut susciter, est-il nécessaire de s'emmerder la vie en 12000 dimensions ? Si le cerveau pouvait opérer au niveau symbolique, il le ferait !



!!! note
     Je suis un peu déçu de ne pas trouver la trace de mes hypothèses sur la structure des layers du LLM dans les 2 papiers que j'ai étudiés, hormis la confirmation qu'ils se sont bien placés au centre du pipeline de blocs d'attention pour tenter d'y trouver les concepts de plus haut niveau.



## Réflexions

Utiliser mon algo d'apprentissage pour retrouver la signification des *features* isolées par l'*auto-encoder* de [^4] ?

 → Si on liste tous les concepts associés aux mots/phrases sur lesquels la *feature* est activée, on peut peut-être trouver les points communs ?

 → Ca fait un peu "serpent qui se mord la queue" dans la mesure où les concepts associés à ces phrase/mots sont justement les trucs qu'on veut arriver à déterminer... :sweat:

 → Apparemment ils ont fait un truc automatisé en demandant à Claude (un LLM) de faire une généralisation à partir des tokens sur lesquels la *feature* s'est activée : une IA qui décode une autre IA :sweat_smile: .



[^1]: Anthropic AI, ["Towards Monosemanticity: Decomposing Language Models With Dictionary Learning"](https://transformer-circuits.pub/2023/monosemantic-features/index.html)
[^2]:  Anthropic AI, ["Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet"](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html)
[^3]: Anthropic AI, ["Distributed Representations: Composition & Superposition"](https://transformer-circuits.pub/2023/superposition-composition/index.html)
[^4]:  Gershman S. J. et al., ["Key Value Memory in the Brain"](https://arxiv.org/abs/2501.02950)
[^5]: Wotao Yin, ["Sparse Recovery Guarantees"](https://ise.ncsu.edu/wp-content/uploads/sites/9/2020/08/SparseRecoveryGuarantees.pdf)
[^6]: Jermin A., Olah C., Henighan T., ["Finite Data Intermediate Regime"](https://transformer-circuits.pub/2023/july-update/index.html#finite-data)
[^7]: 