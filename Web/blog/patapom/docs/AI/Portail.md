# Introduction

Je vais écrire toute cette section en français car *1)* j'ai besoin de renouer avec cette langue et *2)* il est impératif que je sois le plus clair possible, ce que je ne peux faire que dans ma langue natale.
(Et aussi *3)*, je suis à peu près persuadé que le français est une langue bien plus intéressante et précise pour entraîner un apprentissage sémantique, même si on part avec un handicap puisque les datasets existants sont souvent en anglais)

A l'heure où j'écris ces lignes, j'ai totalement perdu l'habitude d'écrire en français et je suis dans un état d'épuisement mental assez conséquent dû aux suites d'un burn out sévère en 2016 dont je ne me suis jamais totalement remis,
 le tout doublé d'une privation de sommeil et d'un accaparement constant d'attention et d'énergie apparemment assez typiques de la condition de papa d'un jeune enfant! :sweat_smile:


## Intelligence Artificielle

On va donc parler d'intelligence artificielle (IA) mais pas seulement !
Mon approche de l'IA est hybride : à la fois curieux des progrès en [Machine Learning](https://en.wikipedia.org/wiki/Machine_learning) (ML) de ces dernières années grâce au [Deep Learning](https://en.wikipedia.org/wiki/Deep_learning) tout en restant très critique vis-à-vis de cette technique;
 je continue de m'intéresser de près à tout ce qui touche aux *neurosciences*, à la *psychologie* et à la *philosophie*.

Dans cette section de blog, on va discuter de mon approche sur le sujet qui transparaîtra, je l'espère, à travers diverses notes.


### Pas besoin d'intelligence

Déjà, contrairement à la majorité des gens dans le domaine de l'IA, je ne m'intéresse pas du tout à l'aspect *intelligence* lui-même : mon but est essentiellement de constituer une base de données sémantique capable de "raisonner"
 de manière probabiliste (approche bayésienne) en choisissant les options les plus probables, ce qu'on fera en se basant à la fois sur les nombreux exemples collectés (à la manière de l'approche ML actuelle)
 et à la fois sur un **sens commun** qu'on aura miraculeusement réussi à faire "apprendre" à notre database (DB).

Je veux que cette database soit capable d'extraire la sémantique des textes, audios et vidéos qu'on lui aura fait ingurgiter, de manière à :

1. être capable de synthétiser l'essence sémantique des documents, et
2. répondre à des queries en exploitant les relations sémantiques entre les documents.

En gros, je veux faire un moteur de recherche entièrement sémantique, mais il n'y a aucune notion "d'**agency**" là-dedans.

Je ne cherche pas à résoudre tous les problèmes du monde mais à réaliser le parfait *assistant personnel*.


### Une note concernant l'agency

Ce que j'entends par "agency" c'est le fait de créer un *agent* qu'on va doter d'une volonté, de besoins, d'un moteur de raisonnement, et qu'on va (probablement) tenter d'immerger dans le monde réel (robots) ou un monde virtuel (cf. ma note sur l'[Embodied Cognition](../EmbodiedCognition)).

Pour moi, l'agency est quelque chose d'accessoire, de pas du tout fondamental. J'ai d'ailleurs du mal à voir un intérêt à donner une quelconque volonté à mon système (même si j'ai quelques idées sur la façon de procéder) hormis
 pour en faire un gadget amusant comme on en voit dans de nombreuses séries de SF.
J'ai l'impression que commencer par créer un robot c'est simplement mettre la charrue avant les boeufs.

De même, j'ai très peu d'intérêt pour les questions de **raisonnement** logique tels que l'induction, la déduction ou l'analogie.<br>
Beaucoup de chercheurs partent de l'hypothèse que c'est la clé de l'intelligence, c'est probablement
  en partie vrai mais sans mémoire au préalable, aucun raisonnement logique n'est valable/possible. Encore une fois, c'est quelque chose qu'on pourra envisager par la suite mais ça n'est pas du tout ma priorité.

Il est, à mon avis, non essentiel de développer une agency ou un moteur de raisonnement pour créer ce que je cherche à créer : une mémoire sémantique !

Un algorithme relativement simple de [groupement et d'optimisation des **concepts**](../Apprentissage) entre eux devrait suffire.


## Plan d'ensemble

On va donc détailler les points suivants :

* [Le fondement dans le réel et le bon niveau d'introspection](../FondementRéel)

* [Approche connexionniste](../Connexionnisme)
	* [Les inconvénients d'une structure fixe](../ArchitectureFixe)
	* Le besoin d'une structure "molle" et plastique
	* Vers une informatique tolérante à l'erreur

* La mémoire définit l'être
	* Pourquoi il faut commencer par cerner comment créer la mémoire avant tout autre chose ?
	* [Un focus particulier sur le langage et la manipulation de symboles](../LangageEtSymboles)
	* [Les implications sur la possibilité "d'uploader sa conscience dans la machine"](../UploadConscience)

* Les concepts comme clé de voute de la mémoire et de la connaissance
	* Les concepts "statiques" (noms)
	* L'articulation des concepts "dynamiques" (verbes)
	* [L'apprentissage de nouveaux concepts (grouping / optimizing)](../Apprentissage)

* La notion de "sens commun"
	* [Le besoin d'embodied cognition afin d'expérimenter pleinement le sens commun lié aux phénomènes physiques](../EmbodiedCognition)
	* Les limites de l'embodied cognition: où s'arrête-t-on?
	* La nécessité d'imperfection (pas besoin d'aller jusqu'à Planck!)
	* A-t-on besoin de causalité?

* Réflexions sur la conscience
	* [L'illusion de personnalité](../IllusionPersonnalité)

* Une simple database sans volonté
	* Pas de soucis moraux ou éthiques

* La curiosité comme moteur de la volonté
	* Notamment la poursuite de la collecte d'information
	* La différence entre information et données
	* Une règle simple pour réglementer les agents et résoudre le scénarios catastrophe du fabricateur de trombones (au diable Asimov et ses lois ambigues!)

