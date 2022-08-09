
# Les problèmes avec Word2Vec

Une autre critique que je ferais volontiers aux language models actuels: il semblerait qu'ils ne fassent absolument pas de distinction sémantique!
Ils sont tous, pour autant que j'ai pu voir, basés sur une conversion des mots en vecteurs de haute dimension (ce qu'on appelle un **embedding**, par ex: [*Word2Vec*](https://en.wikipedia.org/wiki/Word2vec) 
utilise des vecteurs de 300 dimensions, idem pour [*ConceptNet*](https://conceptnet.io/)), qui sont ensuite comparés à l'aide d'un simple dot product afin de pouvoir les trier et les associer.


## Ma Database est un peu naze

J'ai pu expérimenter un peu avec Word2Vec et malheureusement, je dois bien avouer que même si l'idée était séduisante, j'ai été tout d'abord extrêmement déçu de la qualité de la database qui a été utilisée
 par Google pour générer ces vecteurs: la majeure partie est peuplée majoritairement de noms propres de gens inconnus (de la téléréalité ?), il y a très peu de noms courants...


## "king" - "man" + "woman" = boulechite!

Ensuite, j'ai pu constater que le célèbre exemple "king" - "man" + "woman" = "queen" est un gros boulechite!

En 1ère position, j'ai obtenu comme résultat le vecteur "king" tandis que "queen" est arrivé seulement à la 3ème position...

De plus, ça m'a fait me rendre compte de l'ineptie de ces exemples puisqu'il s'agit grosso modo d'un effet "bag of word" où les mots sont groupés par leur proximité et leur probabilité d'occurences
 dans les textes du corpus, plus que par un quelconque sens que l'algorithme Word2Vec aurait magiquement extrait de cette soupe de mots!

La preuve de ce que j'avance est simple: il n'existe pas **un seul sens** associé à un mot comme "king", mais ce concept possède de nombreux attributs (outre celui d'être masculin), qui vont exister
 dans de multiples dimensions. En fait, il faudrait autant de dimensions que de *qualités* (le mot est lancé!) qu'on pourrait attribuer à un concept! 300 dimensions n'y suffiraient pas!


## 300 dimensions? C'est tout?

Tout ce que Word2Vec peut tenter de faire c'est de créer des "îlots" de sens sur une sphère à 300 dimensions, mais si par exemple "king" appartient à un îlot "man", ce qui lui confère la propriété
 d'être un homme (comme dans l'exemple), il ne peut pas à la fois appartenir à l'îlot "souverain", à l'îlot "responsable politique", à l'îlot "personne de pouvoir" et, rions un peu, à l'îlot "barbu" :D.

Ou alors ça impliquerait que tous les responsables politiques, les personnes de pouvoir, les souverains et les barbus sont forcément des hommes! (bon, pour les barbus c'est souvent le cas)
Et inversement, si "queen" se rapproche des mêmes îlots "souverain", "responsable politique" et "barbu", alors "queen"  se rapproche également nécessairement de "man" et de "king",
 et donc "queen" ~= "king", ce qui est exactement ce que j'ai pu constater (or, on a rarement vu de reines barbues!)...

En gros pour résumer, le vecteur doit faire un choix: il ne peut conférer qu'un seul "pseudo-sens" au nom qui lui est accolé, ça n'est donc *pas* un outil approprié pour faire de la désambiguisation sémantique
 et par conséquent, il n'est pas non plus approprié pour faire du traitement de texte. Il aidera tout au plus à faciliter les calculs de reconnaissances de groupes de mots employés dans des contextes semblabbles.


## Besoin de sémantique

Un bon language model devrait s'enlever une épine du pied dès le départ en se basant immédiatement sur une représentation sémantique non-ambiguë, plutôt que de se trimballer des ambiguités à tous les niveaux
 de représentation qui travaillent avec ces vecteurs de haute-dimension.

Mon modèle est basé sur des attributs (des qualités/features/propriétés) qu'on confère à des entités, soit directement soit via des [relations](relations). Utiliser des dimensions pour représenter ces attributs
 ferait grossir les vecteurs de manière démesurée si chaque attribut était codé selon une dimension! Or il n'existe pas, comme on l'a vu, de groupements sur une hypersphère qui peuvent prendre en compte tous
 les attributs d'un concept en même temps. Cela interférerait forcément avec les groupements d'un autre concept qui partagerait certains des attributs mais pas d'autres. La structure en vecteurs de hautes dimensions
 n'est tout simplement pas adaptée à l'encodage des attributs sémantiques d'un concept...
