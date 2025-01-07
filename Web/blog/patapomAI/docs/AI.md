# Plan

## Les leçons à tirer des LLMs

recopier un peu ce qu'il y a dans l'index... Essayer de généraliser ce qui se passe dans ce merdier et les implications pour nous ? => Ces trucs créent des **fucking procédures** uniquement à partir de liens pondérés entre des concepts putain !!!

* "comprendre" les structures grammaticales
  * en appliquant de nombreux filtres à travers le mécanisme de multi-head attention et les "query matrices" [^2][^3]
  * en *augmentant / décorant* les tokens de données sémantiques provenant de son vocabulaire (i.e. espace vectoriel de haute dimension) [^4]
* inférer un semblant de sémantique aux phrases qu'ils déchiffrent
* appliquer des **procédures** à partir de ces structures sémantiques pour les transformer en d'autres structures ?
  * Ou est-ce que c'est simplement du *pattern matching* élaboré ?

* générer une réponse en appliquant un *style* d'écriture particulier

## Les fondements de la réflexion

* Structuration des Concepts
  * Peut-on tout représenter ?
* Raisonnement à partir des structures de concepts
  * Comment lire une question et y répondre ?
* Encodage des concepts
  * Y a-t-il besoin d'embedding dans un espace vectoriel ?
    * N'est-ce pas le problème de systèmes physiquement limités en taille de devoir compresser l'espace sémantique en utilisant des vecteurs de haute-dimension ?

## Algorithme d'apprentissage général

* Règles d'apprentissage générales
  * L'importance de compter les occurrences de patterns
    * La base du "fire together wire together" ?
  * Le fait que c'est un mécanisme simple à implémenter biologiquement
* Apprentissage supervisé
  * Importance du tuteur
  * Notion de confiance
* Apprentissage non-supervisé
  * L'importance de fixer des règles
    * Des règles même simples suffisent comme base
  * Notion de certitude et étaiement de la "confiance"
    * La certitude est une notion contextuelle, elle dépend de son environnement
  * Définition de la notion de "avoir du sens" (on sent que quelque chose "clique" et s'emboîte parfaitement dans notre raisonnement : on a *compris* !)

