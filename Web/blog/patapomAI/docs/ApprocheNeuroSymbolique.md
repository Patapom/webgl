# Approche Neuro-Symbolique



Symbole concepts : ⬙ (0x2B19)  ou bien notation &lt; Concept &gt;.



Pourquoi neuro- ? ==> Parce qu'il y a une part de graphe et de poids







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

