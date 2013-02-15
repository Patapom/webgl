// Contains the Manifest class
//
#pragma managed
#pragma once

#include "NodeMesh.h"

using namespace System;
using namespace System::Collections::Generic;
using namespace System::Text;
using namespace System::Xml;
using namespace System::IO;

namespace FBXImporter
{
	ref class	Scene;

	//////////////////////////////////////////////////////////////////////////
	// A Mesh node
	//
	public ref class		Manifest
	{
	public:		// NESTED TYPES

		ref class	NodeMeshAdditionalLayers
		{
		public:		// NESTED TYPES

			ref class	AdditionalLayerElement
			{
			protected:	// FIELDS

				NodeMeshAdditionalLayers^	m_Owner;

				// Description
				String^						m_Name;
				LayerElement::ELEMENT_TYPE	m_ElementType;
				LayerElement::MAPPING_TYPE	m_MappingMode;
				int							m_SemanticIndex;

				// Content
				cli::array<Object^>^		m_Data;

			public:		// PROPERTIES

				// Gets or sets the array of data
				//
				property cli::array<Object^>^	Data
				{
					cli::array<Object^>^	get()								{ return m_Data; }
					void					set( cli::array<Object^>^ _Value )	{ m_Data = _Value; }
				}

			public:		// METHODS

				AdditionalLayerElement( NodeMeshAdditionalLayers^ _Owner, String^ _Name, LayerElement::ELEMENT_TYPE _ElementType, LayerElement::MAPPING_TYPE _MappingMode, int _SemanticIndex )
				{
					m_Owner = _Owner;
					m_Name = _Name;
					m_ElementType = _ElementType;
					m_MappingMode = _MappingMode;
					m_SemanticIndex = _SemanticIndex;

					m_Data = nullptr;
				}

				AdditionalLayerElement( NodeMeshAdditionalLayers^ _Owner, XmlElement^ _Parent )
				{
					m_Owner = _Owner;
					m_Data = nullptr;

					Load( _Parent );
				}

				// Creates an actual layer element from our data
				//
				LayerElement^	CreateActualLayerElement()
				{
					LayerElement^	Result = gcnew LayerElement( m_Name, m_ElementType, m_MappingMode, m_SemanticIndex );
									Result->SetArrayOfData( m_Data );

					return	Result;
				}

				// I/O
				void	Load( XmlElement^ _Parent )
				{
					if ( _Parent->Name != "LayerElement" )
						throw gcnew Exception( "Root element is not \"LayerElement\" !" );

					// Load description
					m_Name = _Parent->GetAttribute( "Name" );
					m_ElementType = (LayerElement::ELEMENT_TYPE) Enum::Parse( LayerElement::ELEMENT_TYPE::typeid, _Parent->GetAttribute( "ElementType" ) );
					m_MappingMode = (LayerElement::MAPPING_TYPE) Enum::Parse( LayerElement::MAPPING_TYPE::typeid, _Parent->GetAttribute( "MappingMode" ) );
					m_SemanticIndex = int::Parse( _Parent->GetAttribute( "SemanticIndex" ) );

					// Load data
					m_Data = nullptr;

					XmlElement^	DataElement = _Parent["Data"];
					if ( DataElement == nullptr )
						return;	// No available data...

					int		DataLength = int::Parse( DataElement->GetAttribute( "Length" ) );
					String^	DataTypeName = DataElement->GetAttribute( "Type" );

					XmlCDataSection^	CDataElement = dynamic_cast<XmlCDataSection^>( DataElement->FirstChild );
					if ( CDataElement != nullptr )
					{	// Values are embedded
						cli::array<String^>^	Separator = gcnew cli::array<String^>( 1 );
												Separator[0] = "£";

						cli::array<String^>^	SeparatedStringValues = CDataElement->Data->Split( Separator, StringSplitOptions::RemoveEmptyEntries );
						if ( SeparatedStringValues->Length != DataLength )
							throw gcnew Exception( "Data array contains " + (SeparatedStringValues->Length-1) + " values where " + DataLength + " were expected !" );

						m_Data = gcnew cli::array<Object^>( DataLength );

						for ( int i=0; i < DataLength; i++ )
						{
							Object^	O = nullptr;
							if ( DataTypeName == "System.Single" )
								O = float::Parse( SeparatedStringValues[i] );
							else if ( DataTypeName == "System.Int32" )
								O = int::Parse( SeparatedStringValues[i] );
							else if ( DataTypeName == "WMath.Point" )
								O = WMath::Point::Parse( SeparatedStringValues[i] );
							else if ( DataTypeName == "WMath.Vector" )
								O = WMath::Vector::Parse( SeparatedStringValues[i] );
							else if ( DataTypeName == "WMath.Vector2D" )
								O = WMath::Vector2D::Parse( SeparatedStringValues[i] );
							else if ( DataTypeName == "WMath.Vector4D" )
								O = WMath::Vector4D::Parse( SeparatedStringValues[i] );
							else
								throw gcnew Exception( "Unsupported type of data \"" + DataTypeName + "\" stored in the \"" + m_Name + "\" additional layer element !" );

							m_Data[i] = O;
						}
					}
					else
					{	// Values must exist in a side file...
						String^		FileName = DataElement->GetAttribute( "DataFileName" );
						if ( FileName == nullptr )
							throw gcnew Exception( "Could not find embedded data or side-file data !" );
						FileInfo^	DataFileName = gcnew FileInfo( Path::Combine( Path::GetDirectoryName( m_Owner->m_Owner->m_ManifestFileName ), FileName ) );
						if ( !DataFileName->Exists )
							throw gcnew Exception( "Specified side-file data \"" + FileName + "\" does not exist on disk !" );

						FileStream^		File = DataFileName->OpenRead();
						BinaryReader^	Reader = gcnew BinaryReader( File );

						m_Data = gcnew cli::array<Object^>( DataLength );

						for ( int i=0; i < DataLength; i++ )
						{
							Object^	O = nullptr;
							if ( DataTypeName == "System.Single" )
								O = Reader->ReadSingle();
							else if ( DataTypeName == "System.Int32" )
								O = Reader->ReadInt32();
							else if ( DataTypeName == "WMath.Point" )
								O = gcnew WMath::Point( Reader->ReadSingle(), Reader->ReadSingle(), Reader->ReadSingle() );
							else if ( DataTypeName == "WMath.Vector" )
								O = gcnew WMath::Vector( Reader->ReadSingle(), Reader->ReadSingle(), Reader->ReadSingle() );
							else if ( DataTypeName == "WMath.Vector2D" )
								O = gcnew WMath::Vector2D( Reader->ReadSingle(), Reader->ReadSingle() );
							else if ( DataTypeName == "WMath.Vector4D" )
								O = gcnew WMath::Vector4D( Reader->ReadSingle(), Reader->ReadSingle(), Reader->ReadSingle(), Reader->ReadSingle() );
							else
								throw gcnew Exception( "Unsupported type of data \"" + DataTypeName + "\" stored in the \"" + m_Name + "\" additional layer element !" );

							m_Data[i] = O;
						}

						Reader->Close();
						File->Close();
						delete File;
					}
				}

				void	Save( XmlElement^ _Parent )
				{
					XmlElement^	Element = _Parent->OwnerDocument->CreateElement( "LayerElement" );
					_Parent->AppendChild( Element );

					// Save description
					Element->SetAttribute( "Name", m_Name );
					Element->SetAttribute( "ElementType", m_ElementType.ToString() );
					Element->SetAttribute( "MappingMode", m_MappingMode.ToString() );
					Element->SetAttribute( "SemanticIndex", m_SemanticIndex.ToString() );

					if ( m_Data == nullptr || m_Data->Length == 0 )
						return;

					// Save data
					XmlElement^	DataElement = _Parent->OwnerDocument->CreateElement( "Data" );
					Element->AppendChild( DataElement );

					Type^	T = m_Data[0]->GetType();

					DataElement->SetAttribute( "Length", m_Data->Length.ToString() );
					DataElement->SetAttribute( "Type", T->FullName );

					if ( m_Data->Length < 2000 )
					{	// Embed as CData
						XmlCDataSection^	CDataElement = _Parent->OwnerDocument->CreateCDataSection( "Values" );
						DataElement->AppendChild( CDataElement );

						StringBuilder^	SB = gcnew StringBuilder();

						for ( int i=0; i < m_Data->Length; i++ )
						{
							if ( T == float::typeid )
								SB->Append( ((float) m_Data[i]).ToString() + "£" );
							else if ( T == int::typeid )
								SB->Append( ((int) m_Data[i]).ToString() + "£" );
							else if ( T == WMath::Point::typeid )
								SB->Append( ((WMath::Point^) m_Data[i])->ToString() + "£" );
							else if ( T == WMath::Vector::typeid )
								SB->Append( ((WMath::Vector^) m_Data[i])->ToString() + "£" );
							else if ( T == WMath::Vector2D::typeid )
								SB->Append( ((WMath::Vector2D^) m_Data[i])->ToString() + "£" );
							else if ( T == WMath::Vector4D::typeid )
								SB->Append( ((WMath::Vector4D^) m_Data[i])->ToString() + "£" );
							else
								throw gcnew Exception( "Unsupported type of data \"" + T->Name + "\" stored in the \"" + m_Name + "\" additional layer element !" );
						}

						CDataElement->Data = SB->ToString();
					}
					else
					{	// Rather write a binary file
						FileInfo^	DataFileName = gcnew FileInfo( m_Owner->m_Owner->m_ManifestFileName + "." + m_Owner->m_NodeName + "." + m_Name + ".LayerData" );
						DataElement->SetAttribute( "DataFileName", DataFileName->Name );

						FileStream^		File = DataFileName->Create();
						BinaryWriter^	Writer = gcnew BinaryWriter( File );

						for ( int i=0; i < m_Data->Length; i++ )
						{
							if ( T == float::typeid )
								Writer->Write( ((float) m_Data[i]) );
							else if ( T == int::typeid )
								Writer->Write( ((int) m_Data[i]) );
							else if ( T == WMath::Point::typeid )
							{
								WMath::Point^	P = dynamic_cast<WMath::Point^>( m_Data[i] );
								Writer->Write( P->x );
								Writer->Write( P->y );
								Writer->Write( P->z );
							}
							else if ( T == WMath::Vector::typeid )
							{
								WMath::Vector^	V = dynamic_cast<WMath::Vector^>( m_Data[i] );
								Writer->Write( V->x );
								Writer->Write( V->y );
								Writer->Write( V->z );
							}
							else if ( T == WMath::Vector2D::typeid )
							{
								WMath::Vector2D^	V = dynamic_cast<WMath::Vector2D^>( m_Data[i] );
								Writer->Write( V->x );
								Writer->Write( V->y );
							}
							else if ( T == WMath::Vector4D::typeid )
							{
								WMath::Vector4D^	V = dynamic_cast<WMath::Vector4D^>( m_Data[i] );
								Writer->Write( V->x );
								Writer->Write( V->y );
								Writer->Write( V->z );
								Writer->Write( V->w );
							}
							else
								throw gcnew Exception( "Unsupported type of data \"" + T->Name + "\" stored in the \"" + m_Name + "\" additional layer element !" );
						}

						Writer->Close();
						File->Close();
						delete File;
					}
				}
			};

		protected:	// FIELDS

			Manifest^						m_Owner;

			String^							m_NodeName;
			List<AdditionalLayerElement^>^	m_AdditionalLayerElements;

		public:		// PROPERTIES

			property String^			NodeName
			{
				String^	get()	{ return m_NodeName; }
			}

		public:		// METHODS

			NodeMeshAdditionalLayers( Manifest^ _Owner, String^ _NodeName )
			{
				m_Owner = _Owner;
				m_NodeName = _NodeName;
				m_AdditionalLayerElements = gcnew List<AdditionalLayerElement^>();
			}

			NodeMeshAdditionalLayers( Manifest^ _Owner, XmlElement^ _Parent )
			{
				m_Owner = _Owner;
				m_AdditionalLayerElements = gcnew List<AdditionalLayerElement^>();

				Load( _Parent );
			}

			// Adds a layer element to the node
			// NOTE : the layer element is effectively added to the scene node by calling the ApplyToNode() method
			//
			AdditionalLayerElement^	AddLayerElement( String^ _Name, LayerElement::ELEMENT_TYPE _ElementType, LayerElement::MAPPING_TYPE _MappingMode, int _SemanticIndex )
			{
				AdditionalLayerElement^	Result = gcnew AdditionalLayerElement( this, _Name, _ElementType, _MappingMode, _SemanticIndex );
				m_AdditionalLayerElements->Add( Result );

				return	Result;
			}

			// Applies the additional data to the provided mesh node
			//
			void	ApplyToNode( NodeMesh^ _Node )
			{
				// Add additional layer elements to the first available layer
				Layer^	L = _Node->Layers[0];

				for ( int LayerElementIndex=0; LayerElementIndex < m_AdditionalLayerElements->Count; LayerElementIndex++ )
				{
					AdditionalLayerElement^	AdditionalLE = m_AdditionalLayerElements[LayerElementIndex];
					LayerElement^			LE = AdditionalLE->CreateActualLayerElement();
					L->AddElement( LE );
				}
			}

			// I/O
			void	Load( XmlElement^ _Parent )
			{
				if ( _Parent->Name != "NodeMeshAdditionalLayers" )
					throw gcnew Exception( "Root element is not \"NodeMeshAdditionalLayers\" !" );

				// Load the node's name
				m_NodeName = _Parent->GetAttribute( "NodeName" );

				// Save the additional layer elements
				XmlElement^	LayerElementsElement = _Parent["LayerElements"];
				if ( LayerElementsElement == nullptr )
					throw gcnew Exception( "Couldn't find \"LayerElements\" section !" );

				m_AdditionalLayerElements->Clear();

				XmlNodeList^	ChildNodes = LayerElementsElement->ChildNodes;
				for ( int ChildIndex=0; ChildIndex < ChildNodes->Count; ChildIndex++ )
				{
					XmlElement^	ChildNode = dynamic_cast<XmlElement^>( ChildNodes[ChildIndex] );
					if ( ChildNode == nullptr || ChildNode->Name != "LayerElement" )
						continue;	// Invalid child

					m_AdditionalLayerElements->Add( gcnew AdditionalLayerElement( this, ChildNode ) );
				}
			}

			void	Save( XmlElement^ _Parent )
			{
				XmlElement^	Element = _Parent->OwnerDocument->CreateElement( "NodeMeshAdditionalLayers" );
				_Parent->AppendChild( Element );

				// Save the node's name
				Element->SetAttribute( "NodeName", m_NodeName );

				// Save the additional layer elements
				XmlElement^	LayerElementsElement = _Parent->OwnerDocument->CreateElement( "LayerElements" );
				Element->AppendChild( LayerElementsElement );

				for ( int LEIndex=0; LEIndex < m_AdditionalLayerElements->Count; LEIndex++ )
					m_AdditionalLayerElements[LEIndex]->Save( LayerElementsElement );
			}
		};


		ref class	MaterialOverride
		{
			// TODO
		};

	protected:	// FIELDS

		Scene^						m_OwnerScene;
		String^						m_ManifestFileName;

		List<NodeMeshAdditionalLayers^>^				m_NodeMeshAdditionalLayers;
		Dictionary<String^,NodeMeshAdditionalLayers^>^	m_NodeName2AdditionalData;


	public:		// PROPERTIES


	public:		// METHODS

		Manifest( Scene^ _OwnerScene, String^ _ManifestFileName );

		// Additional data
		NodeMeshAdditionalLayers^	CreateAdditionalNodeMeshLayers( String^ _NodeName )
		{
			if ( _NodeName == nullptr )
				throw gcnew Exception( "Invalid node name !" );

			if ( m_NodeName2AdditionalData->ContainsKey( _NodeName ) )
				return	m_NodeName2AdditionalData[_NodeName];	// Return existing data

			// Create new data
			NodeMeshAdditionalLayers^	Result = gcnew NodeMeshAdditionalLayers( this, _NodeName );
			m_NodeMeshAdditionalLayers->Add( Result );
			m_NodeName2AdditionalData->Add( _NodeName, Result );

			return	Result;
		}

		// Applies the manifest data to the current scene
		//
		void		ApplyToScene();

		// I/O
		void		Load();
		void		Save();
	};
}
