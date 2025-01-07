# Les leçons à tirer des LLMs

Comme on l'a dit précédemment, les LLMs ne sont probablement pas le modèle de réseau de neurones adapté à une intelligence générale.

* Ils sont trop génériques, et donc trop lourds
* Les faits qui ont servi à l'entraînement du LLM sont stockés **dans** le LLM lui-même, ce qui est aberrant !
  * Ils sont statiques,  il n'y a pas de moyen simple de leur faire ingurgiter des informations au-delà de leur date d'entraînement
    * Soit en fine-tunant les modèles existants pour les adapter à nos propres données, mais ça reste encore très rigide et ça demande des updates constants
    * Soit en les interfaçant, via le langage naturel, avec des databases pour faire du *Retrieval Augmented Generation (RAG)*



Cependant, ils nous ont permis de découvrir des éléments de réflexion très intéressants dont on pourrait se servir pour *reverse engineer* certains mécanismes afin de guider notre compréhension et notre recherche pour la structuration de nos propres modèles.



## Structure d'un LLM

Source : https://dugas.ch/artificial_curiosity/GPT_architecture.html

![](images/LLM/fullarch.png)



Pour aller vite, voici les étapes subies par une séquence de mots passant dans GPT 3 (on n'a toujours pas accès à l'architecture de GPT 4) :

* Tokenization via Byte Pair Encoding (BPE) des mots dans un **vocabulaire de 50,257** tokens, encodage en one-hot (GPT 3 supporte un *context window* de **2048 tokens**)

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
    * On a donc environ 96 x 96 matrices $Q, K, V$ soit environ 7,247,757,312 de paramètres pour ce qui constitue le coeur du modèle
  * Pour finir, on fait un étage de combinaison linéaire de tout ce bazar, puis on décode les tokens et zou !
    * Et on doit faire ça pour chaque token de la séquence, puisqu'on réinjecte la séquence de sortie en entrée
    * C'est tellement du gâchis... :expressionless:



Ci-dessous, le diagramme d'architecture de GPT 1 suivi du diagramme d'architecture d'un *transformer*, qui est à la base de quasiment tous les LLMs actuels :

<img src="../images\LLM\GPT1.png" style="zoom:50%;" /> <img src="../images\LLM\Transformer.png" style="zoom:50%;" />


## Analyse de l'architecture

On peut globalement résumer cette immense architecture en "quelque chose qui applique de nombreux étages de combinaison non-linéaires de vecteurs de grande dimension".

Évidemment, ça veut tout et rien dire à la fois puisqu'il a été prouvé qu'on pouvait modéliser n'importe quel ensemble de données à l'aide d'un réseau de neurones non-linéaire !

Certains indices existent néanmoins, si on analyse les forces et les faiblesses des LLMs :

### Les forces

* Dans l'excellente analyse de 3Blue1Brow sur le mécanisme d'attention[^1], on peut voir que chaque *attention head* a l'air de réaliser une fonction comme "trouver un adjectif associé à un mot", "détecter un nom propre", etc.
  * Comme l'architecture est ré-entrante, on peut imaginer que chaque nouvel étage possède une vision de plus en plus haut niveau et abstraite (conceptuelle) des informations du niveau précédent
    * On peut donc imaginer que c'est assez semblable à ce qui se passe dans les *image classifiers* qui ont l'avantage d'être scrutables via une application comme https://openai.com/index/microscope/ (:scream: DOWN !! Catastrophe ! C'était un outil fantastique ! :sob:)

### Les faiblesses

Maintenant, si l'on se concentre sur les erreurs que font souvent les LLMs, notamment les *near miss*, on voit qu'ils essaient à tout prix de coller à des patterns :

* TODO: Donner les exemples tout pourris, par exemple l'histoire de la chèvre, du loup et du chou qu'on a modifié pour qu'il n'y ait plus aucun challenge, ou l'histoire du codage rot-13 que le LLM ne sait plus du tout effectuer si on fait rot-12 ou n'importe quoi qui n'existe pas à explicitement dans ses données d'entraînement
* On peut donc imaginer qu'à chaque étage, par réorganisation des étages précédents, on essaie de remplir des trous de patterns à matcher !
* Les modèles ont énormément de mal à sortir de "bassins d'attraction" dans leurs données d'entraînement, surtout quand on leur demande des choses sur lesquelles ils n'ont jamais été entraînés, comme par exemple ici où l'on demande à ChatGPT de dessiner un lapin avec 4 oreilles sans jamais y parvenir :![Rabbit4Ears](.\images\LLM\Rabbit4Ears.png)

On voit aussi que le gros problème de ces modèles réside dans la composition d'éléments, les notions de séquences, le calcul et surtout le raisonnement (on oublie ici O3 qui montre des traces de raisonnement, car il est très vraisemblable qu'ils aient une architecture différente pour arriver à ça, probablement quelque chose à base de *Chain of Thought (CoT)*)
* Des modèles comme Dall-E ou Midjourney sont littéralement *incapables* de créer une image correcte quand on leur demande "un cube bleu devant une balle rouge", ou par exemple avec ce prompt[^4] :
  ![RelationalErrors](.\images\LLM\RelationalErrors.png)
* 



### Conclusion ?

Quelles sont les structures et les algorithmes découverts par une telle architecture qui permettraient d'expliquer toutes ces capacités et toutes ces limitations ?

:arrow_right: swizzling, via le mécanisme d'attention

:arrow_right: pattern matching !

:arrow_right: pyramide d'abstraction, via chaque nouveau layer d'attention heads. On effectue des fonctions de plus en plus haut niveau avec des paramètres (concepts) de plus en plus haut niveau. Les fonctions servent même de paramètre d'entrée à d'autres fonctions, il n'y a pas réellement de distinction entre programme et données, comme sur nos ordis classiques...

:arrow_right: possibilité d'apprendre des procédures simples qui consistent à assembler des choses ensemble pour combler les trous (les paramètres) de la procédure → par exemple, une procédure d'addition prend 2 paramètres de type "nombre" et retourne un autre paramètre de type "nombre" qui est censé être la somme des 2 paramètres d'entrée. Il doit y avoir moyen pour le LLM d'encoder les 2 paramètres d'entrée, de les "combiner" (dans l'espace de haute dimension) pour les donner à une "tête" (*attention head*) dont la fonction est de *retrouver* le résultat. Je dis bien *retrouver* et non pas calculer car il a été démontré que le LLM peut "réaliser" des calculs simples mais se vautre sur les calculs complexes, ce qui tendrait à prouver qu'il a stocké tous ces calculs (précalculé, en fait) et ne fait que les retrouver dans sa base de faits interne... Techniquement, il *pourrait* faire des calculs s'il pouvait utiliser de la *ré-entrance* pour appliquer de nombreuses fois la même procédure, un peu à la façon d'une calculette : d'abord une addition, puis le résultat entre dans la multiplication, et ainsi de suite... C'est d'ailleurs peut-être pour ça que le CoT fonctionne, sauf que le LLM doit utiliser l'étape très coûteuse de d'abord repasser dans l'espace "texte" avant de pouvoir être refeedé pour repasser ensuite dans l'espace où il pourrait effectuer l'opération suivante !

:red_circle: Incapacité d'exécuter des procédures qui n'ont pas été apprises (donc pas de raisonnement général)



Archi similaire à auto-encoders (lire le sparse auto encoder) avec un bottleneck qui indique pas forcément moins de paramètres (c'est la même archi, même au centre) mais plutôt que l'on joue avec des symboles => finalement on revient vers les détails de formuler une réponse (un peu du gâchis finalement, puisque c'est grosso modo l'inverse des étages d'entrée pour retourner au niveau de la grammaire/syntaxe)



## Neurones Polysémiques

Discussion sur la polysémie des neurones probablement due à l'architecture figée et la contrainte de place (comme pour les neurones biologiques) => besoin de compresser les données, ça donne aussi une pression naturelle pour la simplification/agglomération de concepts [^5]





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
[^5]:  Anthropic AI, ["Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet"](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html)