# Structure des Concepts

On va aborder ici la partie la plus importante du système, à savoir : la représentation symbolique.

On part de l'idée que l'être humain perçoit, mémorise et raisonne à l'aide de **concepts**.

On se moque de la façon dont les concepts sont stockés dans le cerveau —on a vu dans la note sur la [polysémie neuronale](PolysémieLLM.md) que les réseaux de neurones *tendaient* de toute manière vers un encodage symbolique— ici on suppose juste que les concepts existent et permettent la manipulation et le raisonnement symboliques.



Un concept peut être absolument n'importe quoi : ça peut être un objet réel ou bien une notion abstraite, une idée.
Par exemple : Un cube est un concept. Une forme géométrique est un concept. Un animal est un concept. Une couleur est un concept. Les mathématiques sont un concept. Le goût est un concept.

!!! tip " "
     Les concepts représentent l'ensemble des connaissances accessibles par le cerveau humain.



Ce qui est important ici c'est la structuration et l'assemblage de concepts : les liens qu'ils ont entre eux.

Prenons un exemple :

> Michel Dubois est un homme de 43 ans, il est grand (1m80), il travaille dans l'informatique, il est marié à Julie et ils ont 2 enfants (Lucas et Mireille). Il pratique le tir-à-l'arc sur son temps libre.



On peut facilement transposer cette description en un arbre de propriétés :

* **"Michel Dubois"**
    * Homme
    * Âge = 43 ans
    * Taille = 1m80
    * Travail = Informaticien
    * Épouse = Julie
    * Enfant = Lucas, Mireille
    * Hobby = tir-à-l'arc



On n'aura peut-être pas décrit totalement Michel (et sa passion secrète pour le Jack Daniels), mais on aura en tout cas retranscrit **exactement** l'ensemble des informations contenues dans cette description.



## Peut-on **tout** représenter de cette manière ?

La première question qu'on se pose est évidemment : est-ce qu'on peut représenter **toutes** les situations auxquelles nous sommes confrontés dans tout au long de notre existence ?

Peut-on représenter :

* Un objet réel ? Une idée philosophique ?
* Une [qualia](https://en.wikipedia.org/wiki/Qualia) ?
* Des gens ou des animaux ?
* Des personnages de fiction ?
* Des histoires imaginaires ?
* Des évènements passés ou à venir ? Le temps ?
* Des planètes ? Des étoiles ? Des galaxies ?
* Une action ?
* Une séquence ? Un évènement ?
* Une relation spatiale, temporelle, sociale ?
* Une comparaison ? Une relation d'ordre ? Une grandeur ?
* La multitude ou la singularité ?
* Les exclusions ? Les contraires ? La négation ?
* Une lettre, un symbole, un mot, une phrase, un texte ?
* Une image ? Un son ?



## Notation



Symbole concepts : ⬙ (0x2B19)  ou bien notation &lt; Concept &gt;.





## Notes

* Structuration des Concepts
  * Peut-on tout représenter ?
  * Peut-on comprendre de manière non ambiguë même si l'on attache les concepts n'importe comment ? Ou doit-on respecter une hiérarchie particulière ?
* Raisonnement à partir des structures de concepts
  * Comment lire une question et y répondre ?
* Encodage des concepts
  * Y a-t-il besoin d'embedding dans un espace vectoriel ?
    * N'est-ce pas le problème de systèmes physiquement limités en taille de devoir compresser l'espace sémantique en utilisant des vecteurs de haute-dimension ?
* Cas de la négation / association d'un fait à une "histoire"
    * besoin de pouvoir inverser d'un coup le sens ou la véracité de qqchose
* Notion de quantité attachée n'importe où
* Prototype theory = moyenne de concepts, champs lexicaux, synonymes
* Trigger un concept ==> les bases de la recherche associative
* Couplage fort concept / image ==> lien sur le papier qui montre les zones du cerveau activées quand un concept et l'image de ce concept sont activées : ce sont les mêmes à peu de chose près...



* Plausibilité biologique
    * On sait que les neurones sont facilement excitables par des impulsions ou des patterns de fréquences particuliers [^1][^2]
    * Il est donc aisé pour le cerveau de créer des hiérarchies de neurones activés par la présence ou l'absence de certain attributs / features

Est-ce limité à des variables booléennes ? (propriétés / features d'un objet) ==> cf. note sur la représentation conceptuelle

La question est : comment généralise-t-on ça aux actions et aux procédures ? À la planification (réentrance, récursion) ? À la structuration hiérarchique de concepts, et pas juste à des séquences ?



#### 



* Concepts Moyens
    * le fait qu'on soit binaire (feature ou pas feature) => moyenne des features binaire = vecteur non binaire
    * le prototype permet de classifier aisément
    * les exemples fabriquent le prototype, le prototype classifie les nouveaux exemples, les nouveaux exemples updatent le prototype



* Opérations sur les concepts
    * Y a-t-il une algèbre de manipulation de concepts ?





## Algorithme d'apprentissage général

* Règles d'apprentissage générales
    * L'importance de compter les occurrences de patterns
        * La base du "fire together wire together" ?
    * Le fait que c'est un mécanisme simple à implémenter biologiquement
    * Différence par rapport à la back prop ?
* Apprentissage supervisé
    * Importance du tuteur
    * Notion de confiance
* Apprentissage non-supervisé
    * L'importance de fixer des règles
        * Des règles même simples suffisent comme base
    * Notion de certitude et étaiement de la "confiance"
        * La certitude est une notion contextuelle, elle dépend de son environnement
    * Définition de la notion de "avoir du sens" (on sent que quelque chose "clique" et s'emboîte parfaitement dans notre raisonnement : on a *compris* !)





[^1]:2024, Kirsanov A., ["How your brain chooses to remember"](https://www.youtube.com/watch?v=ceFFEmkxTLg&ab_channel=ArtemKirsanov)
[^2]:2024, Yang W. et al. ["Selection of experience for memory by hippocampal sharp wave ripples"](https://www.science.org/doi/10.1126/science.adk8261) ([site](https://winnieyangwannan.github.io/RippleTagging/projects/1_project/)) ([notebook](https://colab.research.google.com/drive/1qwruNxqS20xIl7sXYwjUA5zXKLTMWuTz?usp=drive_link))
[^3]:
