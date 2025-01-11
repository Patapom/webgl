# Les leçons à tirer des LLMs

Comme on l'a dit précédemment, les LLMs ne sont probablement pas le modèle de réseau de neurones adapté à une intelligence générale.

* Ils sont trop génériques, et donc trop lourds
* Les faits qui ont servi à l'entraînement du LLM sont stockés **dans** le LLM lui-même, ce qui est aberrant : un modèle de langage doit contenir les données qui permettent de transformer le langage en données sémantiques et réciproquement, ni plus ni moins.
  * Ils sont trop rigides, peu amènes à évoluer rapidement. Ils sont totalement statiques, il n'y a pas de moyen *simple* de leur faire ingurgiter des informations au-delà de leur date d'entraînement.
    On doit :
    * Soit *fine tuner* les modèles existants pour les adapter à nos propres données, mais ça reste encore très rigide et ça demande des updates constants
    * Soit les interfacer, via le langage naturel, avec des databases pour faire du *Retrieval Augmented Generation (RAG)*



Cependant, ils nous ont fait découvrir des éléments de réflexion très intéressants dont on pourrait se servir pour *reverse engineer* certains mécanismes afin de guider notre compréhension et notre recherche sur la structuration de nos propres modèles.



## Structure d'un LLM

Source : https://dugas.ch/artificial_curiosity/GPT_architecture.html

![](images/LLM/fullarch.png)



Pour aller vite, voici les étapes subies par une séquence de mots passant dans GPT 3 (on n'a toujours pas accès à l'architecture de GPT 4 à l'heure actuelle) :

* Tokenization via *Byte Pair Encoding (BPE)* des mots dans un **vocabulaire de 50,257** tokens (GPT 3 supporte une *context window* de **2048 tokens**) + encodage en *one-hot*

* Embedding des 2048 one-hot vectors dans un espace vectoriel de **12,288 dimensions**
* Positional Encoding des tokens en leur ajoutant un vecteur dépendant de la position du token dans la séquence (des sine waves à différentes fréquences)
* La matrice de 2048 tokens **x** 12,288 dimensions va ensuite passer dans 96 *attention heads* :
    * Chaque *attention head* va décomposer la matrice en 3 sous-matrices : Queries $Q$, Keys $K$ de 12,288 x 128 paramètres et Values $V$ de 12,288 x 12,288 paramètres (learned)
    * Les matrices Queries $Q$ et Keys $K$ vont être multipliées entre elles ($Q \cdot K^T$ de dimension 12,288 x 12,288) et passer dans un opérateur *Softmax* pour obtenir une matrice qui représente <u>l'importance de chaque token vis-à-vis de tous les autres</u> (on a modélisé l'attention)
    * On multiplie la matrice d'importance avec la matrice Values $V$ pour obtenir un mélange des tokens en fonction de leur importance respective
    * Le résultat de chaque *attention head* sera concaténé en une matrice 2048 x 96 x 128 = 2048 x 12,288 (on retrouve ainsi bien les dimensions de la matrice de départ) 
    * Puis le tout sera multiplié par une grosse matrice de 2048 x 12,288 qui va effectuer une projection linéaire, probablement pour répartir un peu mieux et briser la structure des 128 tokens de chaque *attention head* vu que c'est assez arbitraire de les concaténer les uns à la suite des autres

* La sortie des *attention heads* sera ensuite ajoutée à ses entrées et le résultat normalisé (Add & Norm de la *residual connection*)
* On passe ensuite dans un layer *feed forward + ReLU* de 4 x 12,288 paramètres, qu'on ajoute à son entrée et qu'on normalise (Add & Norm de la *residual connection*)
* :warning: On repasse à nouveau dans une boucle de 96 *attention heads* et on repart pour un tour **et on fait ça 96 fois en tout** !!! :scream:
    * On a donc environ 96 x 96 matrices $Q, K, V$ soit environ 150 milliards de paramètres pour ce qui constitue le cœur du modèle

* Pour finir, on fait un étage de combinaison linéaire de tout ce bazar, puis on décode les tokens et zou !
    * Et on doit faire ça pour chaque token de la séquence, puisqu'on réinjecte la séquence de sortie en entrée
    * C'est tellement du gâchis... :expressionless:




Ci-dessous, le diagramme d'architecture de GPT 1 suivi du diagramme d'architecture d'un *transformer*, qui est à la base de quasiment tous les LLMs actuels :

<img src="../images\LLM\GPT1.png" style="zoom:50%;" /> <img src="../images\LLM\Transformer.png" style="zoom:50%;" />




## Analyse de l'architecture

On peut globalement résumer cette immense architecture en "quelque chose qui applique de nombreux étages de combinaison non-linéaires de vecteurs de grande dimension".<br>
Évidemment, ça veut tout et rien dire à la fois puisqu'il a été prouvé qu'on pouvait modéliser n'importe quel ensemble de données à l'aide d'un réseau de neurones non-linéaires !

Certains indices existent néanmoins, si on analyse les forces et les faiblesses des LLMs :

### Les forces

* Dans l'excellente analyse de 3Blue1Brown sur le mécanisme d'attention[^1], on peut voir que chaque *attention head* a l'air de réaliser une fonction comme "trouver un adjectif associé à un mot", "détecter un nom propre", "détecter un prix ou un nombre hexadécimal", etc. (voir aussi les *features* de bas niveau découvertes par l'équipe d'Anthropic AI dans cette [note](http://localhost:8000/Polys%C3%A9mieLLM/#features-observees))
* Comme l'architecture de type *transformer* est dupliquée de nombreuses fois, on peut imaginer que chaque nouvel étage possède une vision de plus en plus abstraite et haut niveau des informations du niveau précédent
    * On peut donc imaginer que c'est assez semblable à ce qui se passe dans les *image classifiers* qui ont l'avantage d'être scrutables via une application comme https://openai.com/index/microscope/ (:scream: DOWN !! Catastrophe ! C'était un outil fantastique ! :sob:)
        On peut toujours voir à quoi ça ressemblait en lisant l'article qui a servi à la création de cet outil : https://distill.pub/2017/feature-visualization



### Les faiblesses

Si l'on se concentre sur les erreurs que font souvent les LLMs, notamment les *near miss*, on voit qu'ils essaient à tout prix de coller à des patterns :

* TODO: Donner les exemples tout pourris, par exemple l'histoire de la chèvre, du loup et du chou qu'on a modifié pour qu'il n'y ait plus aucun challenge, ou l'histoire du codage rot-13 que le LLM ne sait plus du tout effectuer si on fait rot-12 ou n'importe quoi qui n'existe pas à explicitement dans ses données d'entraînement
    * On peut donc imaginer qu'à chaque étage, par réorganisation des étages précédents, on essaie de remplir des trous de patterns à matcher !
* Les modèles ont énormément de mal à sortir de "bassins d'attraction" dans leurs données d'entraînement, surtout quand on leur demande des choses sur lesquelles ils n'ont jamais été entraînés, comme par exemple ici où l'on demande à ChatGPT de dessiner un lapin avec 4 oreilles sans jamais y parvenir :![Rabbit4Ears](.\images\LLM\Rabbit4Ears.png)

On voit aussi que le gros problème de ces modèles réside dans la composition d'éléments, les notions de séquences, le calcul et surtout le raisonnement (on oublie ici O3 qui montre des traces de raisonnement, car il est très vraisemblable qu'ils aient une architecture différente pour arriver à ça, probablement quelque chose à base de *Chain of Thought (CoT)*)

* Des modèles comme *Dall-E* ou *Midjourney* sont littéralement *incapables* de créer une image correcte quand on leur demande "un cube bleu devant une balle rouge", ou par exemple avec ce prompt[^4] :
    ![RelationalErrors](.\images\LLM\RelationalErrors.png)



### Capacités algorithmiques des LLMs

Quelles sont les structures et les algorithmes découverts par une telle architecture qui permettraient d'expliquer toutes ces capacités et toutes ces limitations ?

:arrow_right: *swizzling* et "décoration sémantique", via le mécanisme d'attention[^3]

:arrow_right: *pattern matching* via le principe-même de connexion des neurones qui vont pouvoir réagir à la présence ou non de plusieurs *features* dans l'étage précédent

:arrow_right: pyramide d'abstraction, via chaque nouveau layer d'*attention heads*. On effectue des fonctions de plus en plus haut niveau avec des paramètres (concepts) de plus en plus haut niveau. Les fonctions servant elles-même de paramètres d'entrée à d'autres fonctions au niveau suivant ; il n'y a plus réellement de distinction entre programme et données comme c'est le cas sur nos ordis classiques...

:arrow_right: possibilité d'apprendre des procédures simples qui consistent à assembler des choses ensemble pour combler les trous (les paramètres) de la procédure<br>→ par exemple, une procédure d'addition prend 2 paramètres de type "nombre" et retourne un autre paramètre de type "nombre" qui est censé être la somme des 2 paramètres d'entrée. Il doit y avoir moyen pour le LLM d'encoder les 2 paramètres d'entrée, de les "combiner" (dans l'espace de haute dimension) pour les donner à une "tête" (*attention head*) dont la fonction est de *retrouver* le résultat. Je dis bien *retrouver* et non pas calculer car il a été démontré que le LLM peut "réaliser" des calculs simples mais se vautre sur les calculs complexes, ce qui tendrait à prouver qu'il a stocké tous ces calculs (précalculé, en fait) et ne fait que les retrouver dans sa base de faits interne... Techniquement, il *pourrait* faire des calculs s'il pouvait utiliser de la *ré-entrance* pour appliquer de nombreuses fois la même procédure, un peu à la façon d'une calculette : d'abord une addition, puis le résultat entre dans la multiplication, et ainsi de suite... C'est d'ailleurs peut-être pour ça que le CoT fonctionne, sauf que le LLM doit utiliser l'étape très coûteuse de d'abord repasser dans l'espace "texte" avant de pouvoir être refeedé pour repasser ensuite dans l'espace où il pourrait effectuer l'opération suivante !

:red_circle: Incapacité d'exécuter des procédures qui n'ont pas été apprises (donc pas de raisonnement général). On est complètement à la merci de la capacité d'abstraction des procédures du modèle, tandis que la complexité des procédures apprises dépendra de la profondeur du modèle. Par exemple, on ne pourra pas faire de calcul qui nécessiterait un nombre inconnu d'étapes à exécuter, à moins de forcer un certain nombre d'étages identiques où l'on pourra chaîner les opérations entre elles et la profondeur du calcul sera de toute manière limitée par le nombre d'étages.



## Hypothèse sur l'architecture des LLMs

Dans un article de blog[^5][^6] sur lequel je suis tombé par hasard, ils font l'hypothèse d'une architecture qui correspond à peu près à mes propres spéculations :

![Speculative Conceptual Model of a Transformer](images\LLM\Speculative Conceptual Model of a Transformer.png)

!!! quote "Quote[^6]"
    One of our most interesting findings is that neurons in the early, middle, and late layers of a large network tend to play very different types of roles, just as features at different depths of conv net vision models are known to be different.<br>(...) Early layer neurons seem to often be involved in mapping the “artificial” structure of tokens to a more natural, semantically meaningful representation.<br>(...) Late layer neurons (those near the output of the network) often do the opposite of what early layer neurons do: they mediate the conversion of words or contextualized tokens back into literal tokens.<br>(...) Neurons in the middle layers often represent more complex, abstract ideas. 



!!! quote
    It seems possible that there may be features which are more like "actions". Indeed, some neurons at the end of the model have been observed to perform very simple "actions", such as [completing multi-token](https://transformer-circuits.pub/2022/solu/index.html#section-6-3-3)[ ](https://transformer-circuits.pub/2022/solu/index.html#section-6-3-3)[words](https://transformer-circuits.pub/2022/solu/index.html#section-6-3-3).





Archi similaire à auto-encoders (lire le sparse auto encoder) avec un bottleneck qui indique pas forcément moins de paramètres (c'est la même archi, même au centre) mais plutôt que l'on joue avec des symboles => finalement on revient vers les détails de formuler une réponse (un peu du gâchis finalement, puisque c'est grosso modo l'inverse des étages d'entrée pour retourner au niveau de la grammaire/syntaxe)



Les vecteurs à 12,288 dimensions vont avoir un usage varié selon la profondeur à laquelle on se trouve:

* C'est probable qu'au début de la chaîne, les vecteurs représentent des combinaisons linéaires des mots/tokens les uns avec les autres afin de "décorer" (d'enrichir sémantiquement) les tokens les uns avec les autres pour faciliter la désambiguïsation, comme c'est très bien expliqué par 3Blue1Brown [^1]  et Mark Riedl [^3].
* Les vecteurs vont ensuite probablement devoir représenter des structures grammaticales pour finir par encoder des structures conceptuelles qui seront la représentation abstraite du prompt d'entrée : le contexte et la requête utilisateur à exécuter.
* Au milieu de la chaîne, les vecteurs vont probablement représenter :
    * Des faits, comme expliqué par la vidéo de 3Blue1Brown [^2] qui montre comment le LLM va combiner les vecteurs entre eux pour obtenir des concepts pourvus d'attributs (en gros, pour réaliser ce que je propose par la suite dans [mon approche neuro-symbolique](ApprocheNeuroSymbolique.md))
    * Des "filtres / procédures à trous" où chaque "trou" va être un paramètre à remplir pour faire fonctionner la procédure, qui va ensuite retourner un nouveau vecteur qu'on va pouvoir fournir en entrée d'une nouvelle procédure à l'étage suivant.
    Le problème étant, comme noté plus haut, que le LLM est fondamentalement limité en nombre d'étages et ne peut pas utiliser de ré-entrance de par la nature-même des réseaux de neurones qui sont toujours *feed forward* (ou alors il faudrait une sorte de *positional encoding* pour indiquer l'étape de processing d'une donnée particulière, sachant que ça n'est probablement pas possible de toute manière car non-différentiable (donc pas compatible avec la backprop) et aucune garantie que le processus s'arrête (*halting problem*))

* À la fin de la chaîne, le LLM doit (malheureusement) redescendre au niveau du token et donc les vecteurs vont de nouveau devoir représenter des figures de style, des structures grammaticales, etc.





Dans le même esprit que la théorie de l'évolution qui s'étend sur des milliards d'années et qui empêche le créationniste moyen d'envisager même comment il est possible que des mécanismes aussi complexes que des humains aient pu apparaître sur de telles échelles de temps, GTP4 comprend 1.8 trillions de paramètres ! Forcément qu'on peut stocker et précalculer la terre entière là-dedans...





###### Brouillon

recopier un peu ce qu'il y a dans l'index... Essayer de généraliser ce qui se passe dans ce merdier et les implications pour nous ? => Ces trucs créent des **fucking procédures** uniquement à partir de liens pondérés entre des concepts putain !!!

* "comprendre" les structures grammaticales
  * en appliquant de nombreux filtres à travers le mécanisme de multi-head attention et les "query matrices" [^1][^2]
  * en *augmentant / décorant* les tokens de données sémantiques provenant de son vocabulaire (i.e. espace vectoriel de haute dimension) [^3]
* inférer un semblant de sémantique aux phrases qu'ils déchiffrent
* appliquer des **procédures** à partir de ces structures sémantiques pour les transformer en d'autres structures ?
  * Ou est-ce que c'est simplement du *pattern matching* élaboré ?

* générer une réponse en appliquant un *style* d'écriture particulier



[^1]:3blue1brown ["Attention in transformers"](https://www.youtube.com/watch?v=eMlx5fFNoYc&ab_channel=3Blue1Brown)
[^2]: 3blue1brown ["How might LLMs store facts"](https://www.youtube.com/watch?v=9-Jl0dxWQs8&t=5s&ab_channel=3Blue1Brown)
[^3]: Mark Riedl, ["Transformers: Origins"](https://mark-riedl.medium.com/transformers-origins-1db4bdfcb3d1)
[^4]: Gary Marcus, ["Don't ride this bike!"](https://garymarcus.substack.com/p/dont-ride-this-bike-generative-ais)
[^5]:Olah C., Jermyn A. ["What would be the most safety-relevant features in Language Models?"](https://transformer-circuits.pub/2023/july-update/index.html#safety-features)
[^6]: Anthropic AI ["Softmax Linear Units"](https://transformer-circuits.pub/2022/solu/index.html#section-6-3)