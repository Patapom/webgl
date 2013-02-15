// This is the main DLL file.

#include "stdafx.h"

#include "Manifest.h"
#include "Scene.h"

using namespace	FBXImporter;

Manifest::Manifest( Scene^ _OwnerScene, String^ _ManifestFileName )
{
	m_OwnerScene = _OwnerScene;
	m_ManifestFileName = _ManifestFileName;

	m_NodeMeshAdditionalLayers = gcnew List<NodeMeshAdditionalLayers^>();
	m_NodeName2AdditionalData = gcnew Dictionary<String^,NodeMeshAdditionalLayers^>();
}

void	Manifest::Load()
{
	XmlDocument^	Doc = gcnew XmlDocument();
					Doc->Load( m_ManifestFileName );

	XmlElement^	Root = Doc["Manifest"];
	if ( Root == nullptr )
		throw gcnew Exception( "Failed to retrieve the root \"Manifest\" element !" );

	// Load node additional data
	XmlElement^		NodeMeshAdditionalLayersElement = Root["NodeMeshAdditionalLayers"];
	if ( NodeMeshAdditionalLayersElement != nullptr )
	{
		m_NodeMeshAdditionalLayers->Clear();
		m_NodeName2AdditionalData->Clear();

		XmlNodeList^	ChildNodes = NodeMeshAdditionalLayersElement->ChildNodes;
		for ( int ChildNodeIndex=0; ChildNodeIndex < ChildNodes->Count; ChildNodeIndex++ )
		{
			XmlElement^	ChildNode = dynamic_cast<XmlElement^>( ChildNodes[ChildNodeIndex] );
			if ( ChildNode == nullptr || ChildNode->Name != "NodeMeshAdditionalLayers" )
				continue;	// Invalid child...

			// Load the data
			NodeMeshAdditionalLayers^	Data = gcnew NodeMeshAdditionalLayers( this, ChildNode );

			// Store them
			m_NodeMeshAdditionalLayers->Add( Data );
			m_NodeName2AdditionalData[Data->NodeName] = Data;
		}
	}
}

void	Manifest::Save()
{
	XmlDocument^	Doc = gcnew XmlDocument();
	XmlElement^		Root = Doc->CreateElement( "Manifest" );
	Doc->AppendChild( Root );

	// Create node additional data section
	XmlElement^		NodeMeshAdditionalLayersElement = Doc->CreateElement( "NodeMeshAdditionalLayers" );
	Root->AppendChild( NodeMeshAdditionalLayersElement );

	for ( int NodeDataIndex=0; NodeDataIndex < m_NodeMeshAdditionalLayers->Count; NodeDataIndex++ )
		m_NodeMeshAdditionalLayers[NodeDataIndex]->Save( NodeMeshAdditionalLayersElement );

	Doc->Save( m_ManifestFileName );
}

void	Manifest::ApplyToScene()
{
	for ( int NodeIndex=0; NodeIndex < m_NodeMeshAdditionalLayers->Count; NodeIndex++ )
	{
		NodeMeshAdditionalLayers^	NMAL = m_NodeMeshAdditionalLayers[NodeIndex];
		Node^						SceneNode = m_OwnerScene->FindNode( NMAL->NodeName );
		if ( SceneNode == nullptr )
			throw gcnew Exception( "MANIFEST => Failed to retrieve a scene node named \"" + NMAL->NodeName + "\" ! Can't apply node mesh additional layers ! (are you sure the manifest file corresponds to the FBX file ?)" );
		NodeMesh^					SceneNodeMesh = dynamic_cast<NodeMesh^>( SceneNode );
		if ( SceneNode == nullptr )
			throw gcnew Exception( "MANIFEST => Scene node named \"" + NMAL->NodeName + "\" is not a MESH node ! Can't apply node mesh additional layers ! (are you sure the manifest file corresponds to the FBX file ?)" );

		NMAL->ApplyToNode( SceneNodeMesh );
	}
}
