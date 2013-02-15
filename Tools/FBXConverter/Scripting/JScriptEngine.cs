using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

using System.Security.Policy;
using System.CodeDom;
using System.CodeDom.Compiler;

using Microsoft.JScript;

namespace FBXConverter
{
	/// <summary>
	/// Class hosting a JScript.Net engine
	/// </summary>
	public class	JScriptEngine
	{
		#region FIELDS

		// Security policy
		protected Evidence					m_Evidence = null;

		// The list of script codes registered to the engine
		protected List<string>				m_ScriptCodes = new List<string>();

		// The list of referenced assemblies
		protected List<AssemblyName>		m_References = new List<AssemblyName>();

		// The dictionary of compilation options
		protected Dictionary<string,object>	m_CompilationOptions = new Dictionary<string,object>();

		// Options
		protected bool						m_bIsGeneratingDebugInfos = false;

		// The list of default assembly references
		protected static AssemblyName[]		ms_DefaultReferences = new AssemblyName[0];


		//////////////////////////////////////////////////////////////////////////
		// Generated data
		protected string					m_LastWarnings = null;
		protected string					m_LastErrors = null;
		protected Assembly					m_GeneratedAssembly = null;

		#endregion

		#region PROPERTIES

		public Evidence		Evidence
		{
			get { return m_Evidence; }
			set { m_Evidence = value; }
		}

		public Assembly		GeneratedAssembly
		{
			get { return m_GeneratedAssembly; }
		}

		public string		LastWarnings
		{
			get { return m_LastWarnings; }
		}

		public string		LastErrors
		{
			get { return m_LastErrors; }
		}

		#endregion

		#region METHODS

		public JScriptEngine()
		{
		}

		public void		SetCompilationOption( string _Name, object _Value )
		{
			_Name = _Name.ToLower();
			m_CompilationOptions[_Name] = _Value;
		}

		public void		AddScriptCode( string _Code )
		{
			m_ScriptCodes.Add( _Code );
		}

		public void		AddReference( Assembly _Assembly )
		{
			AddReference( _Assembly.GetName() );
		}

		public void		AddReference( AssemblyName _AssemblyName )
		{
			m_References.Add( _AssemblyName );
		}

		public void		CompileAssembly()
		{
			//////////////////////////////////////////////////////////////////////////
			// 0] Check the code DOM is availble for JScript
			if ( !CodeDomProvider.IsDefinedLanguage( "JScript" ) )
				throw new Exception( "The Code DOM for JScript is not available !" );

			CodeDomProvider	JSCriptCodeDOMProvider = CodeDomProvider.CreateProvider( "JScript" );

			//////////////////////////////////////////////////////////////////////////
			// 1] Gather the code items
			string[]	SourceTexts = new string[1 + m_ScriptCodes.Count];
			SourceTexts[0] = GenerateStartupSource();
			for ( int CodeItemIndex=0; CodeItemIndex < m_ScriptCodes.Count; CodeItemIndex++ )
				SourceTexts[1 + CodeItemIndex] =  m_ScriptCodes[CodeItemIndex];


			//////////////////////////////////////////////////////////////////////////
			// 2] Gather the references
			string[]	References = new string[ms_DefaultReferences.Length + m_References.Count];

				// 2.1) Default references first
			for ( int DefaultReferenceIndex=0; DefaultReferenceIndex < ms_DefaultReferences.Length; DefaultReferenceIndex++ )
				References[DefaultReferenceIndex] = ms_DefaultReferences[DefaultReferenceIndex].FullName;

				// 2.2) Custom references then
			for ( int ReferenceIndex=0; ReferenceIndex < m_References.Count; ReferenceIndex++ )
				References[ms_DefaultReferences.Length + ReferenceIndex] = m_References[ReferenceIndex].FullName;


			//////////////////////////////////////////////////////////////////////////
			// 3] Build the params out of the available options
			CompilerParameters	Params = new CompilerParameters( References );

			try
			{
				// --- Evidence
				Params.Evidence = m_Evidence;

				// --- Target
				Params.GenerateExecutable = false;
				if ( GetOption( "target" ) != null )
					switch ( (GetOption( "target" ) as string).ToLower() )
					{
						case	"winexe":
						case	"exe":
							Params.GenerateExecutable = true;
							break;

						case	"module":
						case	"library":
							Params.GenerateExecutable = false;
							break;
					}

				// --- Generate in memory
				Params.GenerateInMemory = true;

				// --- Debug infos
				Params.IncludeDebugInformation = false;
				if ( GetOption( "debug" ) != null )
					m_bIsGeneratingDebugInfos = Params.IncludeDebugInformation = (bool) GetOption( "debug" );

				// --- Entry point
				Params.MainClass = "";

				// --- Referenced Assemblies
//				Params.ReferencedAssemblies = null;		// Already specified

				// --- Treat warnings as errors
				Params.TreatWarningsAsErrors = false;
				if ( GetOption( "warnaserror" ) != null )
					Params.TreatWarningsAsErrors = (bool) GetOption( "warnaserror" );

				// --- Warning level
				if ( GetOption( "warn" ) != null )
					Params.WarningLevel = (int) GetOption( "warn" );

				// --- Win32 Resource
				if ( GetOption( "win32res" ) != null )
					Params.Win32Resource = GetOption( "win32res" ) as string;
			}
			catch ( Exception _e )
			{
				throw new Exception( "InternalCompilerError: Invalid engine option!", _e );
			}


			//////////////////////////////////////////////////////////////////////////
			// 4] COMPILE!
			CompilerResults		Results = null;
			try
			{
				Results = JSCriptCodeDOMProvider.CompileAssemblyFromSource( Params, SourceTexts );
			}
			catch ( Exception _e )
			{
				throw new Exception( "InternalCompilerError: Compiler Inner-Exception", _e );
			}
			finally
			{
				JSCriptCodeDOMProvider.Dispose();
			}


			//////////////////////////////////////////////////////////////////////////
			// 5] Check for errors
			StringBuilder	Warnings = new StringBuilder();
			StringBuilder	Errors = new StringBuilder();
			foreach ( CompilerError Error in Results.Errors )
			{	// Oops!
				StringBuilder	Target = Error.IsWarning ? Warnings : Errors;

				Target.Append( "Error " + Error.ErrorNumber );
//				Target.Append( " " + System.IO.Path.GetFileName( Error.FileName ) );	// <= The filename is randomly generated and is useless
				Target.Append( " (" + Error.Line + ", " + Error.Column + ")" );
				Target.Append( " : " + Error.ErrorText );	
				Target.Append( "\r\n" );
			}

			m_LastWarnings = Warnings.ToString();
			m_LastErrors = Errors.ToString();

			if ( Results.Errors.HasErrors )
				throw new Exception( "CompilationError: " + m_LastErrors );

			// 6] Get the assembly
			m_GeneratedAssembly = Results.CompiledAssembly;
		}


		protected string	GenerateStartupSource()
		{
			return	Properties.Resources.StartupScriptCode;
		}

		protected object	GetOption( string _OptionName )
		{
			return	m_CompilationOptions.ContainsKey( _OptionName ) ? m_CompilationOptions[_OptionName] : null;
		}

		#endregion
	}
}
