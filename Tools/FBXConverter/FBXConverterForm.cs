using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.IO;
using System.Windows.Forms;
using System.Reflection;

namespace FBXConverter
{
	public partial class FBXConverterForm : Form
	{
		#region FIELDS

		// Registry key for the app
		protected Microsoft.Win32.RegistryKey	m_AppKey = null;
		protected Microsoft.Win32.RegistryKey	m_PresetKey = null;
		protected Dictionary<string,string>		m_DefaultGUIValues = new Dictionary<string,string>();

		// The assembly generated from the compilation of the script
		protected Assembly		m_GeneratedAssembly = null;

		#endregion

		#region METHODS

		public FBXConverterForm()
		{
			InitializeComponent();

			m_AppKey = Microsoft.Win32.Registry.CurrentUser.CreateSubKey( @"Software\PatAPI\FBXConverter" );

			// Setup default GUI values
			m_DefaultGUIValues["textBoxScriptFile"] = Path.Combine( Path.GetDirectoryName( Application.ExecutablePath ), @"Default.jscript" );
			m_DefaultGUIValues["comboBoxConvertDiffuse"] = "0";
			m_DefaultGUIValues["comboBoxConvertNormal"] = "0";
			m_DefaultGUIValues["comboBoxConvertRegular"] = "0";

			// Read back presets
			string[]	Presets = (m_AppKey.GetValue( "Presets", "Default" ) as string).Split( ';' );
			string		LastPreset = m_AppKey.GetValue( "LastPreset", "Default" ) as string;

			foreach ( string Preset in Presets )
				if ( Preset != "" )
					comboBoxPreset.Items.Add( Preset );
			comboBoxPreset.SelectedItem = LastPreset;	// This should load preferences from the last preset

			// Subscribe to the serializer's static events
			JSONSerializer.Helpers.ShowMessageBox += new JSONSerializer.Helpers.ShowMessageBoxEventHandler( Serializer_ShowMessageBox );
			JSONSerializer.Helpers.ShowSingletonMessageBox += new JSONSerializer.Helpers.ShowSingletonMessageBoxEventHandler( Serializer_ShowSingletonMessageBox );
		}

		protected override void OnClosing( CancelEventArgs e )
		{
			StorePreferences();

			// Save presets & last selected preset
			string	Presets = "";
			foreach ( string Preset in comboBoxPreset.Items )
				Presets += Preset + ";";
			m_AppKey.SetValue( "Presets", Presets );
			m_AppKey.SetValue( "LastPreset", comboBoxPreset.SelectedItem.ToString() );

			// Exit the FBX SDK Manager singleton
			FBXImporter.Scene.ExitSDKManager();

			base.OnClosing( e );
		}

		#region Preferences I/O

		protected void	LoadPreferences()
		{
			if ( m_PresetKey == null )
				return;

			FieldInfo[]	Fields = this.GetType().GetFields( BindingFlags.Instance | BindingFlags.NonPublic );
			foreach ( FieldInfo Field in Fields )
			{
				Control	C = Field.GetValue( this ) as Control;
				if ( !IsOptionChild( C ) )
					continue;	// Only concern about controls child of the options group box

				if ( typeof(CheckBox).IsAssignableFrom( Field.FieldType ) )
				{
					bool	bValue = false;
					if ( bool.TryParse( ReadGUIKey( Field.Name ), out bValue ) )
						((CheckBox) C).Checked = bValue;
				}
				else if ( typeof(RadioButton).IsAssignableFrom( Field.FieldType ) )
				{
					bool	bValue = false;
					if ( bool.TryParse( ReadGUIKey( Field.Name ), out bValue ) )
						((RadioButton) C).Checked = bValue;
				}
				else if ( Field.FieldType == typeof(TextBox) )
					((TextBox) C).Text = ReadGUIKey( Field.Name );
				else if ( Field.FieldType == typeof(ComboBox) )
				{
					int	Value = 0;
					if ( int.TryParse( ReadGUIKey( Field.Name ), out Value ) )
						((ComboBox) C).SelectedIndex = Value;
				}
				else if ( Field.FieldType == typeof(IntegerTrackbarControl) )
				{
					int	Value = 0;
					if ( int.TryParse( ReadGUIKey( Field.Name ), out Value ) )
						((IntegerTrackbarControl) C).Value = Value;
				}
			}
		}

		protected void	StorePreferences()
		{
			if ( m_PresetKey == null )
				return;

			// Save preset infos
			FieldInfo[]	Fields = this.GetType().GetFields( BindingFlags.Instance | BindingFlags.NonPublic );
			foreach ( FieldInfo Field in Fields )
			{
				Control	C = Field.GetValue( this ) as Control;
				if ( !IsOptionChild( C ) )
					continue;	// Only concern about controls child of the options group box

				if ( typeof(CheckBox).IsAssignableFrom( Field.FieldType ) )
					WriteGUIKey( Field.Name, ((CheckBox) C).Checked.ToString() );
				else if ( typeof(RadioButton).IsAssignableFrom( Field.FieldType ) )
					WriteGUIKey( Field.Name, ((RadioButton) C).Checked.ToString() );
				else if ( Field.FieldType == typeof(TextBox) )
					WriteGUIKey( Field.Name, ((TextBox) C).Text );
				else if ( Field.FieldType == typeof(ComboBox) )
					WriteGUIKey( Field.Name, ((ComboBox) C).SelectedIndex.ToString() );
				else if ( Field.FieldType == typeof(IntegerTrackbarControl) )
					WriteGUIKey( Field.Name, ((IntegerTrackbarControl) C).Value.ToString() );
			}
		}

		protected void		WriteGUIKey( string _Name, string _Value )
		{
			m_PresetKey.SetValue( _Name, _Value );
		}

		protected string	ReadGUIKey( string _Name )
		{
			return	m_PresetKey.GetValue( _Name, m_DefaultGUIValues.ContainsKey( _Name ) ? m_DefaultGUIValues[_Name] : "" ) as string;
		}

		protected bool		IsOptionChild( Control _C )
		{
			if ( _C == null )
				return	false;

			return	_C.Parent == groupBoxOptions || IsOptionChild( _C.Parent );
		}

		#endregion

		protected int	m_ObjectsCount = 0;
		protected int	m_TotalObjectsCount = 0;

		/// <summary>
		/// Converts a FBX file into an O3D scene ready to be serialized
		/// </summary>
		/// <param name="_File"></param>
		/// <returns></returns>
		protected JSONSerializer.Serializer.O3DScene	Convert( FileInfo _File )
		{
			// Clear message boxes so the questions get asked again...
			JSONSerializer.Helpers.ClearSingletonMessageBoxStates();

			//////////////////////////////////////////////////////////////////////////
			// Generate the conversion assembly if not done yet...
			try
			{
				GenerateAssemblyFromJScript();
			}
			catch ( Exception _e )
			{
				throw new Exception( "An error occurred while generating the JScript assembly !", _e );
			}

			//////////////////////////////////////////////////////////////////////////
			// Try and load the scene
			//
			FBXImporter.Scene	Scene = new FBXImporter.Scene();
			try
			{
				Scene.LoadFile( _File.FullName );
			}
			catch ( Exception _e )
			{
				throw new Exception( "An error occurred while loading the FBX Scene \"" + _File.FullName + "\"!", _e );
			}

			m_ObjectsCount = 0;
			m_TotalObjectsCount = Scene.NodesCount + Scene.Materials.Length;
			m_TotalObjectsCount++;	// +1 because we suppose "Validating the scene" is an object
			m_TotalObjectsCount++;	// +1 because we suppose "Generating the scene archive" is an object

			//////////////////////////////////////////////////////////////////////////
			// Build the JSON serializer
			//
			JSONSerializer.Serializer	Serializer = new JSONSerializer.Serializer();

			// Setup the global serialization options (internal to the serializer)
			Serializer.PrettyPrint = checkBoxPrettyPrint.Checked;

			Serializer.NoTangentSpaceAction = radioButtonNoTSNotify.Checked ? JSONSerializer.Serializer.NO_TANGENT_SPACE_ACTION.THROW : (radioButtonNoTSSkip.Checked ? JSONSerializer.Serializer.NO_TANGENT_SPACE_ACTION.SKIP : JSONSerializer.Serializer.NO_TANGENT_SPACE_ACTION.VALIDATE);
			Serializer.StoreHDRVertexColors = checkBoxStoreHDRVertexColors.Checked;

				// Compacting options
			Serializer.CompactIdenticalMeshes = checkBoxCompactMeshes.Checked;
			Serializer.MinUVsCount = integerTrackbarControlMinUVs.Value;

				// Consolidation options
			Serializer.ConsolidateSplitByUV = checkBoxConsolidateSplitByUV.Checked;
			Serializer.ConsolidateSplitBySMG = checkBoxConsolidateSplitBySG.Checked;
			Serializer.ConsolidateSplitByColor = checkBoxConsolidateSplitByColor.Checked;

				// Texture conversion & embedding options
			Serializer.TargetTexturesBaseDirectory = checkBoxCopyTexturesToBaseDirectory.Checked ? new DirectoryInfo( textBoxTexturesBaseDirectory.Text ) : null;

			Serializer.ConvertDiffuse = (JSONSerializer.Serializer.TEXTURE_CONVERSION_TYPES) comboBoxConvertDiffuse.SelectedIndex;
			Serializer.GenerateMipMapsDiffuse = checkBoxGenerateDiffuseMipMaps.Checked;
			Serializer.ConvertNormal = (JSONSerializer.Serializer.TEXTURE_CONVERSION_TYPES) comboBoxConvertNormal.SelectedIndex;
			Serializer.GenerateMipMapsNormal = checkBoxGenerateNormalMipMaps.Checked;
			Serializer.ConvertRegular = (JSONSerializer.Serializer.TEXTURE_CONVERSION_TYPES) comboBoxConvertRegular.SelectedIndex;
			Serializer.GenerateMipMapsRegular = checkBoxGenerateRegularMipMaps.Checked;
			Serializer.JPEGQuality = integerTrackbarControlJPGQuality.Value;

			// Setup the static serialization options (available to the script)
			JSONSerializer.Options.GenerateBoundingBoxes = checkBoxGenerateBBox.Checked;
			JSONSerializer.Options.ResetXForm = checkBoxResetXForm.Checked;
			JSONSerializer.Options.GenerateTriangleStrips = checkBoxGenerateTriangleStrips.Checked;
			JSONSerializer.Options.ConsolidateMeshes = checkBoxConsolidate.Checked;
			JSONSerializer.Options.GenerateTangentSpace = checkBoxGenerateTangentSpace.Checked;
			JSONSerializer.Options.StorePivotAsCustomData = checkBoxStorePivot.Checked;
			JSONSerializer.Options.EmbedTextures = radioButtonStoreTextures.Checked;
			JSONSerializer.Options.CompactUVs = checkBoxCompactUVs.Checked;
			JSONSerializer.Options.ExportAnimations = checkBoxExportAnimations.Checked;


			// Begin serialization
			Serializer.Begin();


			//////////////////////////////////////////////////////////////////////////
			// Run the JScript engine on that file
			//
			try
			{
				Type	ConverterType = m_GeneratedAssembly.GetType( "Converter" );
				if ( ConverterType == null )
					throw new Exception( "Couldn't find the \"Converter\" type needed to convert the FBX file!" );

				ConstructorInfo	Ctor = ConverterType.GetConstructor( new Type[] {} );
				if ( Ctor == null )
					throw new Exception( "Couldn't find the \"Converter\" type constructor! Can't start conversion..." );

				object	ConverterInstance = null;
				try
				{
					ConverterInstance = Ctor.Invoke( new object[] {} );
				}
				catch ( Exception _e )
				{
					throw new Exception( "An error occurred while invoking the converter constructor!", _e );
				}

				// ===================================================================
				// Start nodes conversion
				MethodInfo	ConvertNodeMethod = ConverterType.GetMethod( "ConvertNode" );
				if ( ConvertNodeMethod == null )
					throw new Exception( "Couldn't retrieve the \"ConvertNode()\" method on the \"Converter\" type! Can't start conversion..." );

				RecurseConvertNode( ConverterInstance, ConvertNodeMethod, Scene.RootNode, Serializer, null );

				// ===================================================================
				// Start materials conversion
				MethodInfo	ConvertMaterialMethod = ConverterType.GetMethod( "ConvertMaterial" );
				if ( ConvertMaterialMethod == null )
					throw new Exception( "Couldn't retrieve the \"ConvertMaterial()\" method on the \"Converter\" type! Can't start conversion..." );

				foreach ( FBXImporter.Material Material in Scene.Materials )
				{
					// Notify progress
					m_ObjectsCount++;
					Progress( (float) m_ObjectsCount / m_TotalObjectsCount );

					try
					{
						ConvertMaterialMethod.Invoke( ConverterInstance, new object[] { Material, Serializer } );
					}
					catch ( Exception _e )
					{
						throw new Exception( "\"ConvertMaterial()\" method threw an exception converting material \"" + Material.Name + "\" !", _e );
					}
				}
			}
			catch ( Exception _e )
			{
				throw new Exception( "An error occurred while invoking the JScript assembly!", _e );
			}

			//////////////////////////////////////////////////////////////////////////
			// Validate scene
			//
			JSONSerializer.Serializer.O3DScene	ConvertedScene = null;
			try
			{
				ConvertedScene = Serializer.ValidateScene();
			}
			catch ( Exception _e )
			{
				throw new Exception( "An error occurred while validating O3D scene !", _e );
			}

			// Notify progress
			m_ObjectsCount++;
			Progress( (float) m_ObjectsCount / m_TotalObjectsCount );


			//////////////////////////////////////////////////////////////////////////
			// Build the list of files to embed in the scene archive
			GenerateArchive( new FileInfo( Path.Combine( Path.GetDirectoryName( _File.FullName ), Path.GetFileNameWithoutExtension( _File.FullName ) + ".o3dtgz" ) ), ConvertedScene );

			// Notify progress
			m_ObjectsCount++;
			Progress( (float) m_ObjectsCount / m_TotalObjectsCount );


			//////////////////////////////////////////////////////////////////////////
			// Dispose...
			//
			Scene.Dispose();

			return	ConvertedScene;
		}

		protected void	RecurseConvertNode( object _ConverterInstance, MethodInfo _ConvertNodeMethod, FBXImporter.Node _Node, JSONSerializer.Serializer _Serializer, object _ParentJSONObject )
		{
			if ( _Node == null )
				return;

			// Notify progress
			m_ObjectsCount++;
			Progress( (float) m_ObjectsCount / m_TotalObjectsCount );

			// Convert the node
			object	JSONObject = null;
			try
			{
				JSONObject = _ConvertNodeMethod.Invoke( _ConverterInstance, new object[] { _Node, _Serializer, _ParentJSONObject } );
			}
			catch ( Exception _e )
			{
				throw new Exception( "\"ConvertNode()\" method threw an exception converting node \"" + _Node.Name + "\" !", _e );
			}

			// Recurse through children
			foreach ( FBXImporter.Node Child in _Node.Children )
				RecurseConvertNode( _ConverterInstance, _ConvertNodeMethod, Child, _Serializer, JSONObject );
		}

		protected void	GenerateArchive( FileInfo _SceneFileName, JSONSerializer.Serializer.O3DScene _Scene )
		{
			DirectoryInfo	TargetDirectory = null;
			if ( radioButtonOutputFilesToDirectory.Checked )
			{
				try
				{
					TargetDirectory = new DirectoryInfo( textBoxOutputSceneFilesDirectory.Text );
					if ( !TargetDirectory.Exists )
						throw new Exception( "Selected scene directory \"" + textBoxOutputSceneFilesDirectory.Text + "\" does not exist !" );
				}
				catch ( Exception _e )
				{
					MessageBox.Show( this, "Can't generate scene file because of the following error :\r\n" + FormatException( _e ), "FBXConverter", MessageBoxButtons.OK, MessageBoxIcon.Error );
					return;
				}
			}
			else
			{
				TargetDirectory = new DirectoryInfo( Path.Combine( Path.GetTempPath(), Guid.NewGuid().ToString( "N" ) ) );
				TargetDirectory.Create();
			}

			try
			{

				List<FileInfo>	ArchiveFiles = new List<FileInfo>();
				StreamWriter	Writer = null;

				//////////////////////////////////////////////////////////////////////////
				// Build the identifier file (must be first !)
				FileInfo		IDFileName = new FileInfo( Path.Combine( TargetDirectory.FullName, "aaaaaaaa.o3d" ) );
				Writer = IDFileName.CreateText();
				Writer.Write( "o3d" );
				Writer.Close();

				ArchiveFiles.Add( IDFileName );

				//////////////////////////////////////////////////////////////////////////
				// Concatenate all the vertex buffers into a single binary file
				FileInfo	VBFile = new FileInfo( Path.Combine( TargetDirectory.FullName, "vertex-buffers.bin" ) );
				FileStream	Stream = VBFile.Create();

				_Scene.SerializeVertexBuffers( Stream );

				Stream.Flush();
				Stream.Close();

				ArchiveFiles.Add( VBFile );

				//////////////////////////////////////////////////////////////////////////
				// Concatenate all the index buffers into a single binary file
				FileInfo	IBFile = new FileInfo( Path.Combine( TargetDirectory.FullName, "index-buffers.bin" ) );
							Stream = IBFile.Create();

				_Scene.SerializeIndexBuffers( Stream );

				Stream.Flush();
				Stream.Close();

				ArchiveFiles.Add( IBFile );

				//////////////////////////////////////////////////////////////////////////
				// Concatenate all the curve buffers into a single binary file
				if ( _Scene.HasCurves )
				{
					FileInfo	CBFile = new FileInfo( Path.Combine( TargetDirectory.FullName, "curve-keys.bin" ) );
								Stream = CBFile.Create();

					_Scene.SerializeCurveBuffers( Stream );

					Stream.Flush();
					Stream.Close();

					ArchiveFiles.Add( CBFile );
				}

				//////////////////////////////////////////////////////////////////////////
				// Build the JSON scene file

				FileInfo		SceneFileName = new FileInfo( Path.Combine( TargetDirectory.FullName, "scene.json" ) );
				Writer = SceneFileName.CreateText();

				_Scene.SerializeJSON( Writer );

				Writer.Flush();
				Writer.Close();

				ArchiveFiles.Add( SceneFileName );

				//////////////////////////////////////////////////////////////////////////
				// Store all the published files
				foreach ( JSONSerializer.IFilesProvider FP in _Scene.GetFileProviders() )
				{
					for ( int FileIndex=0; FileIndex < FP.FilesCount; FileIndex++ )
					{
						bool			bEmbed = true;
						DirectoryInfo	TargetDir = TargetDirectory;

						// Check if there is a directory override
						if ( FP.TargetDirectory != null )
						{	// Okay so this file is not embedded in the archive...
							TargetDir = FP.TargetDirectory;
							bEmbed = false;
						}

						FileInfo	F = new FileInfo( Path.Combine( TargetDir.FullName, FP.FileNames[FileIndex] ) );
						Stream = F.Create();

						byte[]	FileContent = FP.Files[FileIndex];
						Stream.Write( FileContent, 0, FileContent.Length );

						Stream.Flush();
						Stream.Close();

						if ( bEmbed )
							ArchiveFiles.Add( F );
					}
				}

				//////////////////////////////////////////////////////////////////////////
				// Build the TGZ scene archive
				if ( radioButtonGenerateTGZ.Checked )
					O3DHelpers.Archive.CreateArchiveFromFiles( _SceneFileName, ArchiveFiles.ToArray(), true );
			}
			catch ( Exception _e )
			{
				throw new Exception( "An error occurred while generating scene archive !", _e );
			}
			finally
			{
				if ( radioButtonGenerateTGZ.Checked )
					try
					{
						TargetDirectory.Delete( true );
					}
					catch ( Exception )
					{
						// Silently fail
					}
			}
		}

		#region Helpers

		protected void	GenerateAssemblyFromJScript()
		{
			if ( m_GeneratedAssembly != null )
				return;	// We already have a valid assembly...

			JScriptEngine	Engine = new JScriptEngine();

			Engine.Evidence = System.Reflection.Assembly.GetExecutingAssembly().Evidence;

			// Add the source code
			FileInfo	ScriptFile = new FileInfo( textBoxScriptFile.Text );
			if ( !ScriptFile.Exists )
				throw new Exception( "Specified script file \"" + ScriptFile.FullName + "\" does not exist !" );

			StreamReader	Reader = ScriptFile.OpenText();
			Engine.AddScriptCode( Reader.ReadToEnd() );
			Reader.Close();

			// Add needed references
			Engine.AddReference( new System.Reflection.AssemblyName( "System.Windows.Forms.dll" ) );

			// That's kinda lame but I couldn't figure out how to resolve the dependencies other than setting the default directory back to the application's
			string	AppDir = Path.GetDirectoryName( Application.ExecutablePath );
			Directory.SetCurrentDirectory( AppDir );

			Engine.AddReference( new System.Reflection.AssemblyName( "O3DHelpers.dll" ) );
			Engine.AddReference( new System.Reflection.AssemblyName( "JSONSerializer.dll" ) );
			Engine.AddReference( new System.Reflection.AssemblyName( "SharpMath.dll" ) );

//			Engine.SetCompilationOption( "debug", true );

			// Generate assembly
			try
			{
				labelError.Text = "Building...";
				this.Enabled = false;

				Engine.CompileAssembly();
				labelError.Text = "Last compilation successful...";
			}
			catch ( Exception _e )
			{
				labelError.Text = "Last compilation failed !";
				throw new Exception( "An error occurred while generating the JScript assembly needed for conversion!", _e );
			}
			finally
			{
				this.Enabled = true;
			}

			m_GeneratedAssembly = Engine.GeneratedAssembly;
		}

		protected float	m_GlobalProgress = 0.0f;
		protected float	m_LocalProgressFactor = 0.0f;
		protected void	Progress( float _fLocalProgress )
		{
			progressBar.Value = (int) (progressBar.Maximum * (m_GlobalProgress + m_LocalProgressFactor * _fLocalProgress));
		}

		protected string	FormatException( Exception _e )
		{
			string	Result = "";
			string	Prefix = "";
			while ( _e != null )
			{
				Result += Prefix + ". " + _e.Message + "\r\n";
				Prefix += "    ";
				_e = _e.InnerException;
			}

			return	Result;
		}

		#endregion

		#endregion

		#region EVENT HANDLERS

		private void buttonConvert_Click( object sender, EventArgs e )
		{
			openFileDialog.FileName = m_AppKey.GetValue( "LastSelectedFBXFile", Application.ExecutablePath ) as string;
			if ( openFileDialog.ShowDialog( this ) != DialogResult.OK )
				return;

			m_AppKey.SetValue( "LastSelectedFBXFile", openFileDialog.FileName );

			// Convert each of the selected files
			string	Errors = "";
			string	Warnings = "";

// 			if ( openFileDialog.FileNames.Length > 1 )
// 				throw new Exception( "Propose merging..." );


			for ( int FileIndex=0; FileIndex < openFileDialog.FileNames.Length; FileIndex++ )
			{
				m_GlobalProgress = (float) FileIndex / openFileDialog.FileNames.Length;
				m_LocalProgressFactor = 1.0f / openFileDialog.FileNames.Length;

				try
				{
					FileInfo		SceneFile = new FileInfo( openFileDialog.FileNames[FileIndex] );
					JSONSerializer.Serializer.O3DScene	Scene = Convert( SceneFile );
					if ( checkBoxShowWarnings.Checked && Scene.Warnings.Length > 0 )
					{	// Show warnings
						string	Message = "The following warnings occurred during conversion of scene file \"" + SceneFile.FullName + " :\r\n\r\n";
						int	WarningIndex = 0;
						for ( ; WarningIndex < Math.Min( 20, Scene.Warnings.Length ); WarningIndex++ )
							Message += "\t=> " + Scene.Warnings[WarningIndex] + "\r\n";
						if ( WarningIndex < Scene.Warnings.Length )
							Message += "\t (...)\r\n";

						Warnings += Message;
					}
				}
				catch ( Exception _e )
				{
					Errors += FormatException( _e );
				}
			}


			// TODO : A proper Warnings/Errors collector form !

			if ( Errors != "" )
				MessageBox.Show( this, "Errors occurred during conversion!\r\n\r\n" + Errors, "FBXConverter", MessageBoxButtons.OK, MessageBoxIcon.Error );
			else
			{
				if ( Warnings != "" )
				{
					string	Message = openFileDialog.FileNames.Length + " files were successfully converted but the following warnings occurred :\r\n\r\n";
							Message += Warnings;
					MessageBox.Show( this, Message, "FBXConverter", MessageBoxButtons.OK, MessageBoxIcon.Warning );
				}
				else
					MessageBox.Show( this, "Done !\r\n" + openFileDialog.FileNames.Length + " files were successfully converted !", "FBXConverter", MessageBoxButtons.OK, MessageBoxIcon.Information );
			}
		}

		protected DialogResult	Serializer_ShowMessageBox( string _Message, MessageBoxButtons _Buttons, MessageBoxIcon _Icon )
		{
			return	MessageBox.Show( this, _Message, this.Text, _Buttons, _Icon );
		}

		protected DialogResult Serializer_ShowSingletonMessageBox( string _Message, MessageBoxButtons _Buttons, MessageBoxIcon _Icon, out bool _bShowAgain )
		{
			return	MessageBoxSingleton.Show( this, _Message, this.Text, _Buttons, _Icon, out _bShowAgain );
		}

		private void checkBoxConsolidate_CheckedChanged( object sender, EventArgs e )
		{
			groupBoxConsolidate.Enabled = checkBoxConsolidate.Checked;
		}

		private void checkBoxCompactMeshes_CheckedChanged( object sender, EventArgs e )
		{
			if ( checkBoxCompactMeshes.Checked && checkBoxResetXForm.Checked )
			{
				MessageBox.Show( this, "When the \"compact meshes\" option is checked, you shouldn't enable the Reset X-Form. Reset X-Form will now be disabled.\r\nNOTE : If you re-enable Reset X-Form, the meshes are less likely to be compacted.", "FBXConverter", MessageBoxButtons.OK, MessageBoxIcon.Information );
				checkBoxResetXForm.Checked = false;
			}
		}

		private void buttonRebuildScript_Click( object sender, EventArgs e )
		{
			try
			{
				// Clear previously generated assembly
				m_GeneratedAssembly = null;

				// Generate it again
				GenerateAssemblyFromJScript();

				errorProvider.SetError( buttonRebuildScript, null );
			}
			catch ( Exception _e )
			{
				string	ErrorText = "An exception occurred while generating the JScript assembly !\r\n\r\n" + FormatException( _e );
				MessageBox.Show( this, ErrorText, this.Text, MessageBoxButtons.OK, MessageBoxIcon.Error );
				errorProvider.SetError( buttonRebuildScript, ErrorText );
			}
		}

		private void buttonLoadScript_Click( object sender, EventArgs e )
		{
			openScriptFileDialog.FileName = m_AppKey.GetValue( "LastSelectedScriptFile", Application.ExecutablePath ) as string;
			if ( openScriptFileDialog.ShowDialog( this ) != DialogResult.OK )
				return;

			m_AppKey.SetValue( "LastSelectedScriptFile", openScriptFileDialog.FileName );

			textBoxScriptFile.Text = openScriptFileDialog.FileName;

			// Clear the generated assembly
			m_GeneratedAssembly = null;
		}

		private void buttonBrowseTextureBaseDirectory_Click( object sender, EventArgs e )
		{
			folderBrowserDialog.SelectedPath = m_AppKey.GetValue( "LastSelectedTextureBaseDirectory", "" ) as string;
			if ( folderBrowserDialog.ShowDialog( this ) != DialogResult.OK )
				return;

			m_AppKey.SetValue( "LastSelectedTextureBaseDirectory", folderBrowserDialog.SelectedPath );

			textBoxTexturesBaseDirectory.Text = folderBrowserDialog.SelectedPath;
		}

		private void buttonOutputSceneFiles_Click( object sender, EventArgs e )
		{
			folderBrowserDialogOutputSceneFiles.SelectedPath = m_AppKey.GetValue( "LastSelectedOutputSceneFilesDirectory", "" ) as string;
			if ( folderBrowserDialogOutputSceneFiles.ShowDialog( this ) != DialogResult.OK )
				return;

			m_AppKey.SetValue( "LastSelectedOutputSceneFilesDirectory", folderBrowserDialogOutputSceneFiles.SelectedPath );

			textBoxOutputSceneFilesDirectory.Text = folderBrowserDialogOutputSceneFiles.SelectedPath;
		}

		private void comboBoxPreset_SelectedValueChanged( object sender, EventArgs e )
		{
			// Store preferences for the last preset
			StorePreferences();

			// Create a key for the new preset
			string	Preset = comboBoxPreset.SelectedItem.ToString();
			bool	bExists = false;
			foreach ( string SubKeyName in m_AppKey.GetSubKeyNames() )
				if ( SubKeyName == Preset )
				{	// That key already exists...
					bExists = true;
					break;
				}

			m_PresetKey = m_AppKey.CreateSubKey( Preset );

			// If the key doesn't already exist, store our current settings to the new key
			if ( !bExists )
				StorePreferences();

			// Load preferences for the new preset
			LoadPreferences();
		}

		private void comboBoxPreset_Validating( object sender, CancelEventArgs e )
		{
			// Check that preset doesn't exist
			foreach ( string Preset in comboBoxPreset.Items )
				if ( Preset == comboBoxPreset.Text )
					return;

			// Add the preset
			comboBoxPreset.Items.Add( comboBoxPreset.Text );
			comboBoxPreset.SelectedItem = comboBoxPreset.Text;
		}

		private void buttonRemovePreset_Click( object sender, EventArgs e )
		{
			if ( comboBoxPreset.SelectedItem as string == "Default" )
			{	// Can't delete !
				MessageBox.Show( this, "You cannot delete the default preset !", this.Text, MessageBoxButtons.OK, MessageBoxIcon.Error );
				return;
			}

			if ( MessageBox.Show( this, "Are you sure you want to delete the \"" + comboBoxPreset.SelectedItem + "\" preset ?", this.Text, MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2 ) != DialogResult.Yes )
				return;

			// Switch back to default preset
			string	PresetToDelete = comboBoxPreset.SelectedItem as string;
			comboBoxPreset.SelectedItem = "Default";

			// Perform deletion...
			comboBoxPreset.Items.Remove( PresetToDelete );
			m_AppKey.DeleteSubKey( PresetToDelete );
		}

		#endregion
	}
}