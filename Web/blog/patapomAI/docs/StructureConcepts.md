# Structure des Concepts



Symbole concepts : ⬙ (0x2B19)  ou bien notation &lt; Concept &gt;.





## Les fondements de la réflexion

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



* Plausibilité biologique
    * On sait que les neurones sont facilement excitables par des impulsions ou des patterns de fréquences particuliers [^1][^2]
    * Il est donc aisé pour le cerveau de créer des hiérarchies de neurones activés par la présence ou l'absence de certain attributs / features



* Concepts Moyens
    * le fait qu'on soit binaire (feature ou pas feature) => moyenne des features binaire = vecteur non binaire
    * le prototype permet de classifier aisément
    * les exemples fabriquent le prototype, le prototype classifie les nouveaux exemples, les nouveaux exemples updatent le prototype





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





[^1]: 2024, Kirsanov A., ["How your brain chooses to remember"](https://www.youtube.com/watch?v=ceFFEmkxTLg&ab_channel=ArtemKirsanov)
[^2]: 2024, Yang W. et al. ["Selection of experience for memory by hippocampal sharp wave ripples"](https://www.science.org/doi/10.1126/science.adk8261) ([site](https://winnieyangwannan.github.io/RippleTagging/projects/1_project/)) ([notebook](https://colab.research.google.com/drive/1qwruNxqS20xIl7sXYwjUA5zXKLTMWuTz?usp=drive_link))
[^3]: 
